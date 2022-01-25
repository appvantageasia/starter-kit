import { ApolloError } from '@apollo/client';
import { get, set } from 'lodash/fp';

export type FieldsRemap = { [field: string]: string };

const mergeErrors = (errors, newErrors, remapFields: FieldsRemap) =>
    Object.entries(newErrors).reduce((acc, [key, value]) => {
        const field = get(key, remapFields) || key;

        return set(field, value, acc);
    }, errors);

const getApolloErrors = (error: Error, remapFields?: FieldsRemap): { [field: string]: string } | null => {
    if (error instanceof ApolloError) {
        return error.graphQLErrors.reduce((acc, graphqlError) => {
            // we exclude exception
            const { code, exception, ...fields } = graphqlError.extensions;

            if (code === 'BAD_USER_INPUT') {
                return mergeErrors(acc, fields, remapFields);
            }

            return { ...acc, $root: error.message };
        }, null);
    }

    return null;
};

export default getApolloErrors;
