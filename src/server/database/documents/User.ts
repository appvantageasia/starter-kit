import { ObjectId } from 'mongodb';

export enum OTPKind {
    TOTP = 'totp',
}

export type UserTOTP = { kind: OTPKind.TOTP; secret: string };

export type User = {
    _id: ObjectId;
    username: string;
    password: string;
    passwordFrom: Date;
    previousPasswords: string[];
    displayName: string;
    otpSetup: UserTOTP | null;
    singleSessionMode: boolean;
    email: string;
};

export type UserSession = {
    _id: ObjectId;
    userId: ObjectId;
    createdAt: Date;
    expiresAt: Date;
    lastActivityAt: Date;
    userAgent?: string;
    ip?: string;
};

export type UserWebAuthnCredential = {
    type: 'fido2';
    credentialId: string;
    publicKey: string;
    counter: number;
};

export type UserWebCredential = {
    _id: ObjectId;
    userId: ObjectId | null;
    userAgent: string;
    expiresAt: Date;
    lastUsed: Date | null;
} & UserWebAuthnCredential;
