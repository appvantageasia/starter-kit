import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import ConsolePageWithHeader from '../../../layouts/ConsoleLayout/ConsolePageWithHeader';
import useGoTo from '../../../utilities/useGoTo';
import UserList from './UserList';

const UserListPage = () => {
    const { t } = useTranslation('userList');

    const goToNewUserPage = useGoTo('/console/system/users/new');

    const extra = (
        <Button icon={<PlusOutlined />} onClick={goToNewUserPage} type="primary">
            {t('userList:actions.newUser')}
        </Button>
    );

    return (
        <ConsolePageWithHeader extra={extra} subTitle={t('userList:subTitle')} title={t('userList:title')}>
            <UserList />
        </ConsolePageWithHeader>
    );
};

export default UserListPage;
