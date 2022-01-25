import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import NoItemResult from '../../../components/results/NoItemResult';
import useGoTo from '../../../utilities/useGoTo';

const UserEmptyListResult = () => {
    const { t } = useTranslation('userList');

    // new country link
    const goToNewUserPage = useGoTo('/private/system/users/new');

    return (
        <NoItemResult
            extra={
                <Button onClick={goToNewUserPage} type="primary">
                    {t('userList:noData.action')}
                </Button>
            }
            subTitle={t('userList:noData.message')}
        />
    );
};

export default UserEmptyListResult;
