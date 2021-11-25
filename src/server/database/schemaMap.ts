import { Binary } from 'mongodb';
import config from '../core/config';

const encryptField = (algorithm, bsonType = 'string') => ({
    encrypt: { algorithm, bsonType },
});

export const settingEncryptedProperties = {
    credentials: encryptField('AEAD_AES_256_CBC_HMAC_SHA_512-Random', 'object'),
};

const buildSchemaMap = (keyId: Binary) => ({
    [`${config.db.name}.settings`]: {
        bsonType: 'object',
        encryptMetadata: { keyId: [keyId] },
        properties: settingEncryptedProperties,
    },
});

export default buildSchemaMap;
