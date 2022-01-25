import { Input, InputProps } from 'antd';
import { useField } from 'formik';
import { memo } from 'react';
import FormItem, { FormItemProps } from './FormItem';

export interface InputFieldProps extends Omit<InputProps, 'value' | 'onChange' | 'autoComplete'> {
    name: string;
    label?: string;
    itemProps?: Omit<FormItemProps, 'label' | 'meta' | 'required' | 'children'>;
}

const PasswordField = ({ name, required, label, itemProps, ...props }: InputFieldProps) => {
    const [field, meta] = useField({ name });

    return (
        <FormItem {...itemProps} label={label} meta={meta} required={required}>
            <Input.Password
                autoComplete="off"
                // spread props
                {...props}
                // then spread the field properties itself
                {...field}
            />
        </FormItem>
    );
};

export default memo(PasswordField);
