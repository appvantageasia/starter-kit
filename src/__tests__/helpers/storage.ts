import {
    CreateBucketCommand,
    DeleteBucketCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import config from '../../server/core/config';
import { client } from '../../server/core/storage';

const { bucket } = config.storage;

const emptyBucket = async (): Promise<void> => {
    const listObjectsResponse = await client.send(new ListObjectsV2Command({ Bucket: bucket }));
    const objectNames = listObjectsResponse.Contents.map(object => object.Key).filter(Boolean);

    if (objectNames.length) {
        await client.send(
            new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: objectNames.map(objectName => ({ Key: objectName })),
                },
            })
        );
    }
};

export const createBucket = async (): Promise<void> => {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
};

export const dropBucket = async (): Promise<void> => {
    await emptyBucket();
    await client.send(new DeleteBucketCommand({ Bucket: bucket }));
};
