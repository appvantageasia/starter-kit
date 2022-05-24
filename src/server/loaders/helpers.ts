import DataLoader from 'dataloader';
import { groupBy, keyBy, uniq, mergeWith, concat } from 'lodash/fp';
import { ObjectId } from 'mongodb';

export type GetItems<TDocument> = (keys: ObjectId[]) => Promise<TDocument[]>;

const getDocumentId = <TDocument extends { _id: ObjectId }>(document: TDocument) => document._id.toHexString();

export const buildOneToOneLoader = <TDocument extends { _id: ObjectId }>(
    getItems: GetItems<TDocument>,
    getKey: (document: TDocument) => string = getDocumentId
): DataLoader<ObjectId, TDocument> =>
    new DataLoader<ObjectId, TDocument>(async keys => {
        const documents = await getItems([...keys]);
        const mappedDocuments = keyBy(getKey, documents);

        return keys.map(key => mappedDocuments[key.toHexString()] || null);
    });

export const buildManyToOneLoader = <TDocument extends { _id: ObjectId }>(
    getItems: GetItems<TDocument>,
    getKey: (document: TDocument) => string = getDocumentId
): DataLoader<ObjectId, TDocument[]> =>
    new DataLoader<ObjectId, TDocument[]>(async keys => {
        const documents = await getItems([...keys]);
        const mappedDocuments = groupBy(getKey, documents);

        return keys.map(key => mappedDocuments[key.toHexString()] || []);
    });

const mergeDocuments = mergeWith((objValue = [], srcValue = []) => concat(srcValue, objValue));

export const buildManyToManyLoader = <TDocument extends { _id: ObjectId }>(
    getItems: GetItems<TDocument>,
    getKeys: (document: TDocument) => string[]
): DataLoader<ObjectId, TDocument[]> =>
    new DataLoader<ObjectId, TDocument[]>(async keys => {
        const documents = await getItems([...keys]);

        // first map each documents
        const mappedDocuments = documents.reduce((acc, document) => {
            const entry = Object.fromEntries(uniq(getKeys(document)).map(key => [key, [document]]));

            return mergeDocuments(acc, entry);
        }, {});

        return keys.map(key => mappedDocuments[key.toHexString()] || []);
    });
