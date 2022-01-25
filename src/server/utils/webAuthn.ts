import { Fido2Lib } from 'fido2-lib';
import { ObjectId } from 'mongodb';
import { UserWebAuthnCredential } from '../database';

const toArrayBuffer = (buffer: Buffer) => {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const typedArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < buffer.length; ++i) {
        typedArray[i] = buffer[i];
    }

    return arrayBuffer;
};

const fromBase64 = (data: string) => Buffer.from(data, 'base64');

export const verifyAssertionResponse = async (inputs: {
    userId: ObjectId;
    response: any;
    challenge: string;
    origin: string;
    webCredential: UserWebAuthnCredential;
}) => {
    const { response, webCredential } = inputs;

    const assertion = {
        rawId: toArrayBuffer(fromBase64(response.rawId)),
        response: {
            clientDataJSON: fromBase64(response.response.clientDataJSON).toString('base64url'),
            authenticatorData: toArrayBuffer(fromBase64(response.response.authenticatorData)),
            signature: fromBase64(response.response.signature).toString('base64url'),
            userHandle: response.response.userHandle && fromBase64(response.response.userHandle).toString('base64url'),
        },
    };

    return getFido2Lib().assertionResult(assertion, {
        challenge: inputs.challenge,
        origin: inputs.origin,
        factor: 'either',
        publicKey: webCredential.publicKey,
        prevCounter: webCredential.counter,
        userHandle: Buffer.from(inputs.userId.toHexString()).toString('base64url'),
    });
};

export const verifyAttestationResponse = async (
    response: any,
    challenge: string,
    origin: string
): Promise<UserWebAuthnCredential> => {
    const attestation = {
        rawId: toArrayBuffer(fromBase64(response.rawId)),
        type: 'public-key',
        response: {
            attestationObject: fromBase64(response.response.attestationObject).toString('base64url'),
            clientDataJSON: fromBase64(response.response.clientDataJSON).toString('base64url'),
        },
    };

    const f2l = getFido2Lib();
    const result = await f2l.attestationResult(attestation, { challenge, factor: 'either', origin });

    return {
        type: 'fido2',
        counter: result.authnrData.get('counter'),
        credentialId: Buffer.from(result.authnrData.get('credId')).toString('base64'),
        publicKey: result.authnrData.get('credentialPublicKeyPem'),
    };
};

export const getAttestation = () =>
    getFido2Lib()
        .attestationOptions({})
        .then(options => ({
            ...options,
            challenge: Buffer.from(options.challenge).toString('base64'),
        }));

export const getAssertion = () =>
    getFido2Lib()
        .assertionOptions({})
        .then(options => ({
            ...options,
            challenge: Buffer.from(options.challenge).toString('base64'),
        }));

export const getFido2Lib = () =>
    new Fido2Lib({
        timeout: 60000,
        rpName: 'Apv',
        challengeSize: 32,
        attestation: 'direct',
        cryptoParams: [-7],
        authenticatorAttachment: 'platform',
    });
