import { Divider, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserListDataFragment } from '../../../api';

export type UserListActionsProps = { user: UserListDataFragment };

const UserListActions = ({ user }: UserListActionsProps) => {
    const { t } = useTranslation('userList');

    return (
        <Space size="small" split={<Divider type="vertical" />}>
            <Link to={`/private/system/users/${user.id}`}>{t('userList:actions.view')}</Link>
            <Link to={`/private/system/users/${user.id}/update`}>{t('userList:actions.update')}</Link>
        </Space>
    );
};

export default UserListActions;
