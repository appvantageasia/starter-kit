import config from '../../server/config';
import { minioClient } from '../../server/storage';

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

export const setupEmptyBucket = async (): Promise<void> => {
    const alreadyExist = await minioClient.bucketExists(bucket);

    if (alreadyExist) {
        await emptyBucket();
        await minioClient.removeBucket(bucket);
    }

    await minioClient.makeBucket(bucket, config.storage.provider.region);
};
