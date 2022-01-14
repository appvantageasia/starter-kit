import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ObjectId } from 'mongodb';
import fetch from 'node-fetch';
import { uploadFile, getUploadedFile, getSignedUrlOnUploadedFile } from '../../server/core/storage';
import streamToBuffer from '../../server/utils/streamToBuffer';
import { cleanDatabase, composeHandlers, setupDatabase, createBucket, dropBucket } from '../helpers';

beforeEach(composeHandlers(setupDatabase, createBucket));

afterEach(composeHandlers(cleanDatabase, dropBucket));

const testFile = join(__dirname, 'img.png');

test('Test function uploadFile() followed by getUploadedFile()', async () => {
    const stream = createReadStream(testFile);
    const response = await uploadFile('jest', 'test-01.png', stream);
    expect(ObjectId.isValid(response._id)).toBe(true);
    expect(response.filename).toEqual('test-01.png');
    expect(response.displayName).toEqual('test-01.png');
    expect(response.uploadedAt instanceof Date).toEqual(true);
    expect(response.etag).toEqual('"d6869304047d8495f2465a7b963e10ec"');
    expect(response.objectName).toEqual(`jest/${response._id.toHexString()}.png`);
    const uploadedFileStream = await getUploadedFile(response);
    const uploadedFile = await streamToBuffer(uploadedFileStream);
    const originalFile = await readFile(testFile);
    expect(uploadedFile).toEqual(originalFile);
    const url = await getSignedUrlOnUploadedFile(response);
    const fetchResponse = await fetch(url);
    expect(fetchResponse.status).toEqual(200);
    const fetchedFile = await fetchResponse.buffer();
    expect(fetchedFile).toEqual(originalFile);
});
