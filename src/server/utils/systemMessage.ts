import { ObjectId } from 'mongodb';
import { systemMessagePubSub } from '../schema/resolvers/subscriptions/listenSystemMessages';

export type SystemNoticeMessage = {
    type: 'systemNotice';
    date: Date;
    message: string;
};

export type UserSessionRevokedMessage = {
    type: 'userSessionRevoked';
    date: Date;
    userId: ObjectId;
    sessionId: ObjectId;
    displayNotice: boolean;
};

export type SystemMessage = SystemNoticeMessage | UserSessionRevokedMessage;

export const publishUserSessionRevoked = (userId: ObjectId, sessionId: ObjectId, displayNotice = false) => {
    const message: UserSessionRevokedMessage = {
        type: 'userSessionRevoked',
        date: new Date(),
        userId,
        sessionId,
        displayNotice,
    };

    return systemMessagePubSub.publish(`gql.session.${sessionId.toHexString()}`, { listenSystemMessages: message });
};

export const publishSystemNotice = (notice: string) => {
    const message: SystemNoticeMessage = {
        type: 'systemNotice',
        date: new Date(),
        message: notice,
    };

    return systemMessagePubSub.publish('gql.system.all', { listenSystemMessages: message });
};
