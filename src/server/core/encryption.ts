import { readFileSync } from 'fs';
import { getString, getPrefix } from './env';

export enum EncryptionMode {
    None, // no encryption
    Local, // local master key
    AWS, // AWS KMS
}

/* Setting for local master key */
export type EncryptionLocalSetting = {
    mode: EncryptionMode.Local;
    masterKey: Buffer;
    keyVaultNamespace: string;
};

/* Setting for no encryption */
export type EncryptionNoneSetting = { mode: EncryptionMode.None };

/* Setting for AWS KMS */
export type EncryptionAWSSetting = {
    mode: EncryptionMode.AWS;
    accessKey: string;
    secretKey: string;
    keyVaultNamespace: string;
};

// Encryption Setting may be one among many capabilities
export type EncryptionSetting = EncryptionNoneSetting | EncryptionLocalSetting | EncryptionAWSSetting;

export const getClientSideFieldLevelEncryptionSettings = (): EncryptionSetting => {
    const provider = getString(getPrefix('CSFLE_MODE'));
    const keyVaultNamespace = getString(getPrefix('CSFLE_KEY_VAULT'), 'encryption.__keyVault');

    switch (provider) {
        // we want to use a master key from the local environment
        case 'local': {
            // get the master key path
            const masterKeyPath = getString(getPrefix('CSFLE_MASTER_KEY'));
            // then read key using NodeJS API
            const masterKey = readFileSync(masterKeyPath);

            return {
                // specify our provider
                mode: EncryptionMode.Local,
                // provide our master key
                masterKey,
                // provide the key vault in MongoDB
                keyVaultNamespace,
            };
        }

        // we want to use AWS KMS for the keys
        case 'aws':
            return {
                // specify our provider
                mode: EncryptionMode.AWS,
                // provide AWS credentials to access AWS KMS API
                accessKey: getString(getPrefix('CSFLE_ACCESS_KEY')),
                secretKey: getString(getPrefix('CSFLE_SECRET_KEY')),
                // provide the key vault in MongoDB
                keyVaultNamespace,
            };

        // there's no encryption
        default:
            return { mode: EncryptionMode.None };
    }
};
