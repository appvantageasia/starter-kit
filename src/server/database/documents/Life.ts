import { ObjectId } from 'mongodb';

export type Life = {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    birthday: Date;
    title: string;
    description: string;
    hobbies: string[];
};
