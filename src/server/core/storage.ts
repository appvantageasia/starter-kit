import path from 'path';
import { Readable as ReadableStream } from 'stream';
import { FileUpload } from 'graphql-upload';
import { ItemBucketMetadata, Client } from 'minio';
import { ObjectId } from 'mongodb';
import config from './config';

const { bucket } = config.storage;

export const minioClient = new Client(config.storage.provider);

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
    stream: ReadableStream | Buffer | string,
    metadata?: ItemBucketMetadata
): Promise<UploadedFile> => {
    const fileId = new ObjectId();
    const ext = path.extname(filename);
    const objectName = path.join(dirName, `${fileId}${ext}`);

    // upload it at first
    const { etag } = await minioClient.putObject(bucket, objectName, stream, {
        ...metadata,
        _id: fileId.toHexString(),
    });

    // get stats from it
    const stats = await minioClient.statObject(bucket, objectName);

    return {
        _id: fileId,
        filename,
        displayName: filename,
        uploadedAt: new Date(),
        etag,
        size: stats.size,
        objectName,
    };
};

export const getSignedUrlOnUploadedFile = (file: UploadedFile, expiry = 60): Promise<string> =>
    minioClient.presignedGetObject(bucket, file.objectName, expiry);

export const getFileStream = (file: UploadedFile): Promise<ReadableStream> =>
    minioClient.getObject(bucket, file.objectName);

export const deleteUploadedFile = (file: UploadedFile): Promise<void> =>
    minioClient.removeObject(bucket, file.objectName);

export const deleteUploadedFiles = (files: UploadedFile[]): Promise<void> =>
    minioClient.removeObjects(
        bucket,
        files.map(file => file.objectName)
    );

export const handleFileUpload = async (
    dirName: string,
    upload: FileUpload,
    metadata?: ItemBucketMetadata
): Promise<UploadedFile> => uploadFile(dirName, upload.filename, upload.createReadStream(), metadata);

export const handleMultipleFileUpload = async (
    dirName: string,
    uploads: FileUpload[],
    metadata?: ItemBucketMetadata
): Promise<UploadedFile[]> => Promise.all(uploads.map(upload => handleFileUpload(dirName, upload, metadata)));

export const cloneFile = async (
    dirName: string,
    upload: UploadedFile,
    metadata?: ItemBucketMetadata
): Promise<UploadedFile> => uploadFile(dirName, upload.filename, await getFileStream(upload), metadata);
