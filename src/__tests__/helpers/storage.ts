import config from '../../server/core/config';
import { minioClient } from '../../server/core/storage';

const { bucket } = config.storage;

const emptyBucket = async (): Promise<void> => {
    const stream = await minioClient.listObjectsV2(bucket, '', true);

    return new Promise((resolve, reject) => {
        const objectNames = [];

        stream.on('data', object => {
            objectNames.push(object.name);
        });

        stream.on('error', reject);

        stream.on('end', async () => {
            if (objectNames.length) {
                await minioClient.removeObjects(bucket, objectNames);
            }

            resolve();
        });
    });
};

// eslint-disable-next-line import/prefer-default-export
export const setupEmptyBucket = async (): Promise<void> => {
    const alreadyExist = await minioClient.bucketExists(bucket);

    if (alreadyExist) {
        await emptyBucket();
        await minioClient.removeBucket(bucket);
    }

    await minioClient.makeBucket(bucket, config.storage.provider.region);
};
