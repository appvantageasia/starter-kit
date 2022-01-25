import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { requiresLoggedUser } from '../../middlewares';
import { GraphQLQueryResolvers } from '../definitions';

const query: GraphQLQueryResolvers['generateAuthenticatorSetup'] = async (root, args, { getUser, getTranslations }) => {
    const user = await getUser();
    const { t } = await getTranslations(['userSelf']);

    const secret = authenticator.generateSecret();
    const service = t('userSelf:authenticatorSettings.setup.service');
    const otpAuth = authenticator.keyuri(user.username, service, secret);

    return new Promise((resolve, reject) => {
        qrcode.toDataURL(otpAuth, (error, imageUrl) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    secret,
                    qrcodeUri: imageUrl,
                });
            }
        });
    });
};

export default requiresLoggedUser(query);
