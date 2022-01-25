import { Document } from 'bson';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { getDatabaseContext } from '../../database';
import { publishUserSessionRevoked } from '../../utils/systemMessage';

export type OnUserAuthenticationMessage = { userId: ObjectId; sessionId: ObjectId };

export const onUserAuthenticationHandler = async (message: OnUserAuthenticationMessage, job: Job<Document>) => {
    const { collections } = await getDatabaseContext();
    const user = await collections.users.findOne({ _id: message.userId });

    if (!user.singleSessionMode) {
        // nothing to do
        return;
    }

    // delete other sessions
    const otherSessionsFilter = { userId: user._id, _id: { $ne: message.sessionId } };
    const otherSessions = await collections.userSessions.find(otherSessionsFilter).toArray();

    if (otherSessions.length > 0) {
        // delete all
        await collections.userSessions.deleteMany(otherSessionsFilter);
        // trigger revoke for all
        await Promise.all(
            otherSessions.map(otherSession => publishUserSessionRevoked(user._id, otherSession._id, true))
        );
    }
};
