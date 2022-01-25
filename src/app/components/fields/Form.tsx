import { Form as AntdForm, FormProps as AntdFormProps } from 'antd';
import React, { ReactNode } from 'react';

export type FormProps = {
    children: JSX.Element | ReactNode;
} & Omit<AntdFormProps, 'layout'>;

const Form = ({ children, ...props }: FormProps) => (
    <AntdForm layout="vertical" {...props}>
        {children}
    </AntdForm>
);

export default Form;
