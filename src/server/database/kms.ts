import { MongoClientOptions } from 'mongodb';
import config from '../core/config';
import { EncryptionMode } from '../core/encryption';

const { encryption } = config.db;

const getKMS = (): {
    provider: keyof MongoClientOptions['autoEncryption']['kmsProviders'];
    kmsProviders: MongoClientOptions['autoEncryption']['kmsProviders'];
    keyVaultNamespace: string;
} | null => {
    switch (encryption.mode) {
        case EncryptionMode.Local:
            return {
                provider: 'local',
                kmsProviders: { local: { key: encryption.masterKey } },
                keyVaultNamespace: encryption.keyVaultNamespace,
            };

        case EncryptionMode.AWS:
            return {
                provider: 'aws',
                kmsProviders: {
                    aws: {
                        accessKeyId: encryption.accessKey,
                        secretAccessKey: encryption.secretKey,
                    },
                },
                keyVaultNamespace: encryption.keyVaultNamespace,
            };

        default:
            return null;
    }
};

export default getKMS;
