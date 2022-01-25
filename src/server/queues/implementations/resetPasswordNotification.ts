import { Document } from 'bson';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { ExternalLinkKind, getDatabaseContext } from '../../database';
import { sendResetPasswordEmail } from '../../emails';
import createI18nInstance from '../../utils/createI18nInstance';

export type ResetPasswordNotificationMessage = { linkId: ObjectId };

export const resetPasswordNotificationHandler = async (
    message: ResetPasswordNotificationMessage,
    job: Job<Document>
) => {
    const { collections } = await getDatabaseContext();

    // get the link
    const link = await collections.externalLinks.findOne({ _id: message.linkId });

    if (!link || link._kind !== ExternalLinkKind.ResetPassword) {
        // do not continue as it's unexpected
        return;
    }

    const user = await collections.users.findOne({ _id: link.data.userId });

    if (!user) {
        // do not continue as it's also unexpected
        return;
    }

    // load translations
    const { i18n } = await createI18nInstance();
    await i18n.loadNamespaces(['emails']);

    // send the email
    await sendResetPasswordEmail({
        i18n,
        data: { user, link },
        to: { name: user.displayName, address: user.email },
    });
};
