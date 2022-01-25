import { compare } from 'bcryptjs';
import Dayjs from 'dayjs';
import zxcvbn from 'zxcvbn';
import { User } from '../database';

export const validatePasswordStrength = (password: string, username: string) => {
    const passwordReview = zxcvbn(password, [username]);

    return passwordReview.score >= 3;
};

export const validateNewPassword = async (user: User, password: string) => {
    // check if the password was already in the previous one
    for (const previousPassword of user.previousPasswords) {
        // eslint-disable-next-line no-await-in-loop
        if (await compare(password, previousPassword)) {
            return false;
        }
    }

    return true;
};

export const getPasswordExpirationDate = (creationDate: Date) => Dayjs(creationDate).add(90, 'day');

export const isPasswordExpiredOn = (date: Date) => getPasswordExpirationDate(date).isBefore(new Date());
