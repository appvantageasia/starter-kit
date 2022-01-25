import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Table, Typography } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserListDataFragment, useListUsersQuery } from '../../../api';
import PaginatedTable from '../../../components/PaginatedTable';
import InternalErrorResult from '../../../components/results/InternalErrorResult';
import UserEmptyListResult from './UserEmptyListResult';
import UserListActions from './UserListActions';
import useListReducer from './useListReducer';

const renderBooleanIcon = (value: boolean) => (
    <Typography.Text type={value ? 'success' : 'danger'}>
        {value ? <CheckCircleFilled /> : <CloseCircleFilled />}
    </Typography.Text>
);

const UserList = () => {
    const { t } = useTranslation('userList');

    // get state from a reducer
    const [state, dispatch] = useListReducer();

    // fetch data
    const { page, pageSize, sort } = state;
    const { data, loading, error } = useListUsersQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            pagination: { offset: (page - 1) * pageSize, limit: pageSize },
            sort,
        },
    });

    // prepare items as a data source
    const dataSource = useMemo(() => (data?.list?.items || []).map(item => ({ ...item, key: item.id })), [data]);
    const total = data?.list?.count || 0;

    if (!loading) {
        if (error) {
            return <InternalErrorResult />;
        }

        if (dataSource.length === 0) {
            return <UserEmptyListResult />;
        }
    }

    return (
        <PaginatedTable
            dataSource={dataSource}
            dispatch={dispatch}
            loading={loading}
            rowKey="id"
            state={state}
            total={total}
        >
            <Table.Column key="displayName" dataIndex="displayName" title={t('userList:columns.displayName')} />
            <Table.Column key="email" dataIndex="email" title={t('userList:columns.email')} />
            <Table.Column
                key="isAuthenticatorEnabled"
                dataIndex="isAuthenticatorEnabled"
                render={renderBooleanIcon}
                title={t('userList:columns.isAuthenticatorEnabled')}
            />
            <Table.Column
                key="isPasswordValid"
                dataIndex="isPasswordExpired"
                render={value => renderBooleanIcon(!value)}
                title={t('userList:columns.isPasswordValid')}
            />
            <Table.Column<UserListDataFragment>
                key="actions"
                align="right"
                render={(value, record) => <UserListActions user={record} />}
                title={t('userList:columns.actions')}
            />
        </PaginatedTable>
    );
};

export default UserList;
