import ResetPasswordEmail from './ResetPassword';
import createSender from './createSender';

export const sendResetPasswordEmail = createSender(ResetPasswordEmail);

export * from './transporters';
