import { Table, Pagination, TableProps } from 'antd';
import { Dispatch, useMemo } from 'react';
import styled from 'styled-components';

export type PageState = {
    page: number;
    pageSize: number;
};

export type SetPageAction = { type: 'setPage'; page: number };
export type SetPageSizeAction = { type: 'setPageSize'; pageSize: number };
export type PageAction = SetPageAction | SetPageSizeAction;

export const pageReducer = <State extends PageState = PageState>(state: State, action: PageAction): State => {
    switch (action.type) {
        case 'setPage':
            return { ...state, page: action.page };

        case 'setPageSize':
            return { ...state, page: 0, pageSize: action.pageSize };

        default:
            return state;
    }
};

export type PaginatedTableProps<TItem extends object = any> = Omit<TableProps<TItem>, 'pagination'> & {
    total: number;
    state: PageState;
    dispatch: Dispatch<PageAction>;
};

const PaginationContainer = styled.div`
    margin: 16px 0;
    display: flex;
    flex-wrap: wrap;
    row-gap: 8px;
    justify-content: flex-end;
`;

const PaginatedTable = <TItem extends object = any>({
    state,
    dispatch,
    total,
    ...props
}: PaginatedTableProps<TItem>) => {
    const { page, pageSize } = state;

    // memoize actions on the state
    const actions = useMemo(
        () => ({
            onPageChange: (nextPage: number) => dispatch({ type: 'setPage', page: nextPage }),
            onPageSizeChange: (nextPageSize: number) => dispatch({ type: 'setPageSize', pageSize: nextPageSize }),
        }),
        [dispatch]
    );

    return (
        <>
            <Table {...props} pagination={false} />
            {total > 10 && (
                <PaginationContainer>
                    <Pagination
                        current={page}
                        onChange={actions.onPageChange}
                        onShowSizeChange={actions.onPageSizeChange}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger
                    />
                </PaginationContainer>
            )}
        </>
    );
};

export default PaginatedTable;
