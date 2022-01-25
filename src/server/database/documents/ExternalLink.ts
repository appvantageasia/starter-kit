import { ObjectId } from 'mongodb';

export type ExternalLinkCore<TKind, TData> = {
    _id: ObjectId;
    _kind: TKind;
    expiresAt: Date;
    secret: string;
    data: TData;
    deleteOnFetch: boolean;
};

export enum ExternalLinkKind {
    ResetPassword = 'resetPassword',
}

export type ResetPasswordLink = ExternalLinkCore<ExternalLinkKind.ResetPassword, { userId: ObjectId }>;

export type ExternalLink = ResetPasswordLink;
