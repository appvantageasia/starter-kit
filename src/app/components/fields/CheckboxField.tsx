import { Checkbox, CheckboxProps } from 'antd';
import { useField } from 'formik';
import { memo } from 'react';
import FormItem, { FormItemProps } from './FormItem';

export interface CheckboxFieldProps extends Omit<CheckboxProps, 'onChange'> {
    name: string;
    label?: string;
    itemProps?: Omit<FormItemProps, 'label' | 'meta' | 'required' | 'children'>;
    required?: boolean;
}

const CheckboxField = ({ name, required, label, itemProps, ...props }: CheckboxFieldProps) => {
    const [field, meta] = useField({ name });

    return (
        <FormItem {...itemProps} label={label} meta={meta} required={required}>
            <Checkbox
                checked={field.value}
                // spread props
                {...props}
                // then spread the field properties itself
                {...field}
            />
        </FormItem>
    );
};

export default memo(CheckboxField);
