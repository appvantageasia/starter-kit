import Icon from '@ant-design/icons';
import { Result, ResultProps } from 'antd';
import SvgIcon from './undraw_add_notes_re_ln36.svg';

const EmptyIcon = props => <SvgIcon {...props} height="2em" width="2em" />;

export type NoItemResultProps = Omit<ResultProps, 'status' | 'icon'>;

const NoItemResult = (props: NoItemResultProps) => <Result icon={<Icon component={EmptyIcon} />} {...props} />;

export default NoItemResult;
