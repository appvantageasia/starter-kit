import path from 'path';
import { Readable } from 'stream';
import {
    S3Client,
    GetObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    HeadObjectCommand,
    PutObjectCommand,
    PutObjectRequest,
    ServiceInputTypes,
    ServiceOutputTypes,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { BuildMiddleware, HttpRequest } from '@aws-sdk/types';
import { FileUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import config from './config';

const { bucket } = config.storage;

export const client = new S3Client({
    ...config.storage.provider,
    forcePathStyle: true,
});

export interface UploadedFile {
    _id: ObjectId;
    filename: string;
    displayName: string;
    objectName: string;
    etag: string;
    size: number;
    uploadedAt: Date;
}

export const uploadFile = async (
    dirName: string,
    filename: string,
    stream: PutObjectRequest['Body'],
    metadata?: PutObjectRequest['Metadata']
): Promise<UploadedFile> => {
    const fileId = new ObjectId();
    const ext = path.extname(filename);
    const objectName = path.join(dirName, `${fileId}${ext}`);

    // upload the object
    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: objectName,
            Metadata: { ...metadata, _id: fileId.toHexString() },
            Body: stream,
        })
    );

    // get the head on the uploaded object
    const head = await client.send(
        new HeadObjectCommand({
            Bucket: bucket,
            Key: objectName,
        })
    );

    return {
        _id: fileId,
        filename,
        displayName: filename,
        uploadedAt: new Date(),
        etag: head.ETag || '',
        size: head.ContentLength || 0,
        objectName,
    };
};

// work-around pending fix on @aws-sdk/client-s3
// https://github.com/minio/minio/discussions/14709
const getPresignerClient = (client: S3Client, port?: number | string) => {
    if (!port) {
        // early return if port isn't set
        return client;
    }

    const middlewareName = 'presignHeaderMiddleware';

    const presignHeaderMiddleware: BuildMiddleware<ServiceInputTypes, ServiceOutputTypes> = next => async args => {
        const request = args.request as HttpRequest;
        request.headers.host = [request.hostname, port].join(':');

        return next(args);
    };

    const middlewareStack = client.middlewareStack.clone();

    middlewareStack.addRelativeTo(presignHeaderMiddleware, {
        name: middlewareName,
        relation: 'before',
        toMiddleware: 'presignInterceptMiddleware',
        override: true,
    });

    return { middlewareStack, config: client.config } as S3Client;
};

const endpointUrl = new URL(config.storage.provider.endpoint);
const presignedClient = getPresignerClient(client, endpointUrl.port);

export const getSignedUrlOnUploadedFile = (file: UploadedFile, expiry = 60) =>
    getSignedUrl(
        presignedClient,
        new GetObjectCommand({
            Bucket: bucket,
            Key: file.objectName,
        }),
        { expiresIn: expiry }
    );

export const getUploadedFile = async (file: UploadedFile) => {
    const getObjectResponse = await client.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: file.objectName,
        })
    );

    return getObjectResponse.Body as Readable;
};

export const deleteUploadedFile = (file: UploadedFile) =>
    client.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: file.objectName,
        })
    );

export const deleteUploadedFiles = (files: UploadedFile[]) =>
    client.send(
        new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: files.map(file => ({ Key: file.objectName })),
            },
        })
    );

export const handleFileUpload = async (dirName: string, upload: FileUpload, metadata?: PutObjectRequest['Metadata']) =>
    uploadFile(dirName, upload.filename, upload.createReadStream(), metadata);

export const handleMultipleFileUpload = async (
    dirName: string,
    uploads: FileUpload[],
    metadata?: PutObjectRequest['Metadata']
) => Promise.all(uploads.map(upload => handleFileUpload(dirName, upload, metadata)));

export const cloneFile = async (dirName: string, upload: UploadedFile, metadata?: PutObjectRequest['Metadata']) =>
    uploadFile(dirName, upload.filename, await getUploadedFile(upload), metadata);
