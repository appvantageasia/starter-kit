/* eslint-disable */

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {
    "AuthenticationResponse": [
      "AuthenticationRequiresNewPassword",
      "AuthenticationRequiresTOTP",
      "AuthenticationSuccessful"
    ],
    "ExternalLink": [
      "ResetPasswordLink"
    ],
    "SystemMessage": [
      "MessageNotice",
      "UserSessionRevoked"
    ]
  }
};
      export default result;
    