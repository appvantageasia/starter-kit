import { MongoClient, MongoClientOptions } from 'mongodb';
import config from '../core/config';
import { getEncryptionKeyId } from './helpers';
import getKMS from './kms';
import buildSchemaMap from './schemaMap';

export const getRegularOptions = (): MongoClientOptions => ({
    maxPoolSize: config.db.pool,
});

export const getRegularClient = () => MongoClient.connect(config.db.uri, getRegularOptions());

export const getEncryptedClient = async (kms: Exclude<ReturnType<typeof getKMS>, null>) => {
    const keyId = await getEncryptionKeyId();

    if (!keyId) {
        throw new Error('No encryption key ID have been provided for the schema');
    }

    return MongoClient.connect(config.db.uri, {
        ...getRegularOptions(),

        // enable command monitoring for the client
        monitorCommands: true,

        autoEncryption: {
            keyVaultNamespace: kms.keyVaultNamespace,
            kmsProviders: kms.kmsProviders,
            schemaMap: buildSchemaMap(keyId),

            // configure cryptd client
            extraOptions: {
                mongocryptdURI: config.db.cryptd.uri,
                mongocryptdBypassSpawn: config.db.cryptd.mongocryptdBypassSpawn,
                mongocryptdSpawnArgs: config.db.cryptd.mongocryptdSpawnArgs,
            },
        },
    });
};
