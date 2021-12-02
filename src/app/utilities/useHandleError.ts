import { ApolloError } from '@apollo/client';
import { message } from 'antd';
import { FormikHelpers, FormikValues } from 'formik';
import { set, get } from 'lodash/fp';
import { useMemo } from 'react';

type FieldsRemap = { [field: string]: string };

type SubmitHandler<TValues> = (values: TValues, helpers: FormikHelpers<TValues>) => Promise<void>;

const mergeErrors = (errors, newErrors, remapFields: FieldsRemap) =>
    Object.entries(newErrors).reduce((acc, [key, value]) => {
        const field = get(key, remapFields) || key;

        return set(field, value, acc);
    }, errors);

export const handleErrors =
    <TValues = FormikValues>(handler: SubmitHandler<TValues>, remapFields?: FieldsRemap) =>
    async (values: TValues, helpers: FormikHelpers<TValues>) => {
        try {
            await handler(values, helpers);
        } catch (error) {
            if (error instanceof ApolloError) {
                const { $root: rootError, ...fieldErrors } = error.graphQLErrors.reduce((acc, graphqlError) => {
                    // we exclude exception
                    const { code, exception, ...fields } = graphqlError.extensions;

                    if (code === 'BAD_USER_INPUT') {
                        return mergeErrors(acc, fields, remapFields);
                    }

                    return { ...acc, $root: error.message };
                }, {});

                if (rootError) {
                    message.error(rootError);
                }

                helpers.setErrors(fieldErrors);
            }
        }
    };

const useHandleError = <TValues = FormikValues>(
    callback: SubmitHandler<TValues>,
    dependencies: ReadonlyArray<any>,
    remapFields?: FieldsRemap
) =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => handleErrors(callback, remapFields), [...dependencies, callback, remapFields]);

export default useHandleError;
