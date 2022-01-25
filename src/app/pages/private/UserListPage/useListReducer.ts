import { useReducer } from 'react';
import { UserSortingField, UserSortingRule, SortingOrder } from '../../../api';
import { pageReducer, PageState, PageAction } from '../../../components/PaginatedTable';

type State = PageState & {
    sort: UserSortingRule;
};

type Action = PageAction & { sort: UserSortingRule };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        default:
            return pageReducer(state, action);
    }
};

const useListReducer = () =>
    useReducer(reducer, {
        // default pagination
        page: 1,
        pageSize: 10,

        // default sorting
        sort: {
            field: UserSortingField.Email,
            order: SortingOrder.Asc,
        },
    });

export default useListReducer;
