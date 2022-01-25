import { User } from '../../database';

export enum AuthenticationStep {
    Successful = 'authenticationSuccessful',
    PasswordChange = 'authenticationWithPasswordChange',
    TOTP = 'authenticationWithTOTP',
}

export type AuthenticationResponse =
    | {
          _kind: AuthenticationStep.Successful;
          user: User;
          token: string;
      }
    | {
          _kind: AuthenticationStep.PasswordChange;
          user: User;
          token: string;
      }
    | {
          _kind: AuthenticationStep.TOTP;
          token: string;
      };
