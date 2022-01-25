import { message } from 'antd';
import { FormikErrors, FormikHelpers, FormikValues } from 'formik';
import { useMemo } from 'react';
import getApolloErrors, { FieldsRemap } from '../../server/utils/getApolloErrors';

type SubmitHandler<TValues> = (values: TValues, helpers: FormikHelpers<TValues>) => Promise<void>;

export const handleErrors =
    <TValues = FormikValues>(handler: SubmitHandler<TValues>, remapFields?: FieldsRemap) =>
    async (values: TValues, helpers: FormikHelpers<TValues>) => {
        try {
            await handler(values, helpers);
        } catch (error) {
            const apolloErrors = getApolloErrors(error, remapFields);

            if (apolloErrors !== null) {
                const { $root: rootError, ...fieldErrors } = apolloErrors;

                if (rootError) {
                    message.error(rootError);
                }

                helpers.setErrors(fieldErrors as FormikErrors<TValues>);
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
