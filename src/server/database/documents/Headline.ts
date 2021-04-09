import { ObjectId } from 'mongodb';

export type Headline = {
    _id: ObjectId;
    title: string;
    body: string;
    date: Date;
};