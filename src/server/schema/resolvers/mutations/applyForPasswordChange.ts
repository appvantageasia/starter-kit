import Dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import { resetPasswordRateLimiter } from '../../../core/rateLimiter';
import { ExternalLinkKind, getDatabaseContext, ResetPasswordLink } from '../../../database';
import { mainQueue } from '../../../queues';
import { GraphQLMutationResolvers } from '../definitions';

const mutation: GraphQLMutationResolvers['applyForPasswordChange'] = async (root, { username }, { ip }) => {
    const { collections } = await getDatabaseContext();

    // first ensure the IP and username didn't reach the limits
    const limiterResults = await Promise.all([
        // protect against spamming
        resetPasswordRateLimiter
            .consume(username, 1)
            .then(() => true)
            .catch(() => false),
        // protect against brute forcing
        resetPasswordRateLimiter
            .consume(ip, 1)
            .then(() => true)
            .catch(() => false),
    ]);

    if (limiterResults.some(result => !result)) {
        // limits are reached
        return true;
    }

    // find the user
    const user = await collections.users.findOne({ username });

    if (!user) {
        // does not give the information the user does not exist
        return true;
    }

    // prepare the link
    const link: ResetPasswordLink = {
        _id: new ObjectId(),
        _kind: ExternalLinkKind.ResetPassword,
        secret: nanoid(),
        data: { userId: user._id },
        expiresAt: Dayjs().add(10, 'minute').toDate(), // valid for 10 minute
        deleteOnFetch: false,
    };

    // delete previous links
    await collections.externalLinks.deleteMany({ _kind: ExternalLinkKind.ResetPassword, 'data.userId': user._id });
    // create the link in database
    await collections.externalLinks.insertOne(link);

    // trigger a task to send the email
    await mainQueue.add({ type: 'resetPasswordNotification', linkId: link._id });

    return true;
};

export default mutation;
