import { ObjectId } from 'mongodb';
import { UploadedFile } from '../../core/storage';

export type TopicMessage = {
    _id: ObjectId;
    body: string;
    authorId: ObjectId;
    createdAt: Date;
};

export type Topic = {
    _id: ObjectId;

    title: string;
    body: string;

    messages: TopicMessage[];
    attachments: UploadedFile[];

    authorId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
};
