import { linkRetrievalRateLimiter } from '../../../core/rateLimiter';
import { getDatabaseContext } from '../../../database';
import { GraphQLQueryResolvers } from '../definitions';

const query: GraphQLQueryResolvers['retrieveLink'] = async (root, { id }, { ip }) => {
    const { collections } = await getDatabaseContext();

    // check on the IP to avoid brute forcing
    const limiterResult = await linkRetrievalRateLimiter.get(ip);

    if (limiterResult.remainingPoints <= 0) {
        // do as if there was nothing there
        return null;
    }

    const link = await collections.externalLinks.findOne({
        // matching secret
        secret: id,
        // still valid
        expiresAt: { $gt: new Date() },
    });

    if (!link) {
        // apply a penalty on the IP
        await linkRetrievalRateLimiter.penalty(ip, 1);

        // there's no link
        return null;
    }

    if (link.deleteOnFetch) {
        // delete it as well
        await collections.externalLinks.deleteOne({ _id: link._id });
    }

    return link;
};

export default query;
