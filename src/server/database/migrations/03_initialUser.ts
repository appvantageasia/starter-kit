import { genSalt, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { DatabaseContext } from '../instance';

type User = {
    _id: ObjectId;
    username: string;
    password: string;
    passwordFrom: Date;
    previousPasswords: string[];
    displayName: string;
    otpSetup: null;
    email: string;
};

export default {
    identifier: '03_initialUser',

    async up({ regular: { db } }: DatabaseContext): Promise<void> {
        const salt = await genSalt(10);
        const passwordHash = await hash('password', salt);

        await db.collection<User>('users').insertOne({
            _id: new ObjectId(),
            username: 'root',
            displayName: 'Root user',
            password: passwordHash,
            passwordFrom: new Date(),
            previousPasswords: [],
            otpSetup: null,
            email: 'apvadmin@appvantage.co',
        });
    },
};
