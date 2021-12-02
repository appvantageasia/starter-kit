/* eslint-disable max-classes-per-file */
import { ForbiddenError, UserInputError } from 'apollo-server';

// eslint-disable-next-line import/prefer-default-export
export class InvalidInput extends UserInputError {
    constructor(errors?: any) {
        super('bad request', errors);
    }
}

export class InvalidPermission extends ForbiddenError {
    constructor() {
        super('forbidden');
    }
}
