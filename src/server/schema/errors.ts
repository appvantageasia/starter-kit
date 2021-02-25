/* eslint-disable max-classes-per-file */

export class APIError extends Error {
    public code: string;

    public data: any;

    constructor(code = 'API_ERROR', message = 'API Error', data: any = null) {
        super(message);
        this.code = code;
        this.data = data;
    }
}

export class InvalidPermission extends APIError {
    constructor() {
        super('API_INVALID_PERMISSIONS', 'Invalid permissions');
    }
}

export class InvalidInput extends APIError {
    constructor(errors?: any) {
        super('API_INVALID_INPUT', 'Invalid Input', errors);
    }
}
