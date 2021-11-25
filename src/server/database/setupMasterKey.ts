import crypto from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import Enquirer from 'enquirer';
import {
    ClientEncryption,
    ClientEncryptionCreateDataKeyProviderOptions,
    ClientEncryptionOptions,
} from 'mongodb-client-encryption';
import config from '../core/config';
import { EncryptionMode } from '../core/encryption';
import { getRegularClient } from './client';
import { getCollections } from './collections';
import { SettingId } from './documents';

const getDefaultNamespace = (): [database: string, collection: string] => {
    switch (config.db.encryption.mode) {
        case EncryptionMode.AWS:
        case EncryptionMode.Local: {
            const [database, collection] = config.db.encryption.keyVaultNamespace.split('.');

            if (!database || !collection) {
                throw new Error('Invalid key vault for encryption');
            }

            return [database, collection];
        }

        default:
            return ['encryption', '__keyVault'];
    }
};

const getSetup = async (
    provider: 'aws' | 'local'
): Promise<{
    kmsProviders: ClientEncryptionOptions['kmsProviders'];
    masterKey: ClientEncryptionCreateDataKeyProviderOptions['masterKey'];
}> => {
    switch (provider) {
        // setup local master key
        case 'local': {
            const enquirer = new Enquirer<{ keyPath: string; generateKey: boolean }>();

            // we need to ask for the path to the master key first
            const { keyPath, generateKey } = await enquirer.prompt([
                {
                    type: 'input',
                    name: 'keyPath',
                    message: 'Local path to the master key',
                },
                {
                    type: 'confirm',
                    name: 'generateKey',
                    message: 'Generate a new key',
                },
            ]);

            if (generateKey) {
                // write a new key in the given path
                writeFileSync(keyPath, crypto.randomBytes(96));
            }

            // the master key must be there
            if (!existsSync(keyPath)) {
                throw new Error('Key file does not exist');
            }

            return {
                kmsProviders: {
                    // simply provide the key as a local KMS
                    local: { key: readFileSync(keyPath) },
                },

                // no master key there
                masterKey: undefined,
            };
        }

        case 'aws': {
            // we need to request for AWS IAM security credentials
            // as well as the key ARN and region
            const enquirer = new Enquirer<{
                accessKeyId: string;
                secretAccessKey: string;
                key: string;
                region: string;
            }>();

            // get those information
            const inputs = await enquirer.prompt([
                {
                    type: 'input',
                    name: 'region',
                    message: 'AWS Region',
                    initial: 'ap-southeast-1',
                },
                {
                    type: 'input',
                    name: 'accessKeyId',
                    message: 'AWS Access key ID',
                },
                {
                    type: 'password',
                    name: 'secretAccessKey',
                    message: 'AWS secret access key',
                },
                {
                    type: 'input',
                    name: 'key',
                    message: 'AWS KMS key ARN',
                },
            ]);

            return {
                kmsProviders: {
                    // setup AWS as KMS
                    aws: {
                        accessKeyId: inputs.accessKeyId,
                        secretAccessKey: inputs.secretAccessKey,
                    },
                },

                // define our master
                masterKey: {
                    key: inputs.key,
                    region: inputs.region,
                },
            };
        }

        default:
            throw new Error('Unknown KMS provider');
    }
};

const setupMasterKey = async () => {
    // first we need to enquire about the provider to use for encryption
    // none is not a valid provider as we are looking to setup encryption here
    const enquirer = new Enquirer<{
        database: string;
        collection: string;
        provider: 'aws' | 'local';
        keyAltName: string;
    }>();

    // get default information on the key vault from our environment
    const [initialDatabase, initialCollection] = getDefaultNamespace();

    // get additional information here
    const { database, collection, provider, keyAltName } = await enquirer.prompt([
        {
            type: 'input',
            name: 'database',
            message: 'Vault database',
            initial: initialDatabase,
        },
        {
            type: 'input',
            name: 'collection',
            message: 'Vault collection',
            initial: initialCollection,
        },
        {
            type: 'select',
            name: 'provider',
            message: 'KMS provider',
            choices: ['local', 'aws'],
        },
        {
            type: 'input',
            name: 'keyAltName',
            message: 'Key alt name',
            initial: config.sentry.environment ? `app-${config.sentry.environment}` : 'app',
        },
    ]);

    // first get the regular client
    const client = await getRegularClient();

    try {
        // ensure the vault is protected with an index
        await client
            .db(database)
            .collection(collection)
            .createIndex('keyAltNames', {
                unique: true,
                partialFilterExpression: {
                    keyAltNames: { $exists: true },
                },
            });

        // get methods based on the provider
        const { kmsProviders, masterKey } = await getSetup(provider);

        // then get an encryption client
        const encryptionClient = new ClientEncryption(client, {
            keyVaultNamespace: `${database}.${collection}`,
            kmsProviders,
        });

        // find an existing key
        const existingKey = await client
            .db(database)
            .collection(collection)
            .findOne({ keyAltNames: { $in: [keyAltName] } });

        let keyId: string | null = null;

        if (existingKey) {
            keyId = existingKey._id.toString('base64');
            console.info(chalk.green(`Existing key found: ${keyId}`));
        } else {
            // create the encryption key in the vault
            keyId = (
                await encryptionClient.createDataKey(provider, {
                    keyAltNames: [keyAltName],
                    masterKey,
                })
            )
                // return the base64 for the key ID
                .toString('base64');

            // print it
            console.info(chalk.green(`New key created: ${keyId}`));
        }

        if (!keyId) {
            throw new Error('Failed to get a data key');
        }

        // insert it into our settings as well
        // we don't need to use encrypted client for this single upset
        const regular = { client, db: client.db(config.db.name) };
        const context = { regular, encrypted: regular };
        await getCollections(context).settings.updateOne(
            { settingId: SettingId.EncryptionKeyId },
            {
                $set: {
                    settingId: SettingId.EncryptionKeyId,
                    keyId,
                },
            },
            { upsert: true }
        );
    } finally {
        // close the client
        await client.close();
    }
};

export default setupMasterKey;
