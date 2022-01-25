import { Form, FormItemProps as AntdFormItemProps } from 'antd';
import { FieldMetaProps } from 'formik';
import React from 'react';

export type FormItemProps = {
    meta: FieldMetaProps<any>;
    children: JSX.Element;
} & Omit<AntdFormItemProps, 'validateStatus'>;

const FormItem = ({ meta, children, ...props }: FormItemProps) => {
    const hasError = !!meta.error && meta.touched;

    return (
        <Form.Item {...props} help={hasError ? meta.error : props.help} validateStatus={hasError ? 'error' : 'success'}>
            {children}
        </Form.Item>
    );
};

export default FormItem;
