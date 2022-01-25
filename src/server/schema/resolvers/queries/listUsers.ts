import { Filter, Sort } from 'mongodb';
import { getDatabaseContext, User } from '../../../database';
import { getSortingValue, paginateAggregation } from '../../../utils/pagination';
import {
    GraphQLQueryResolvers,
    GraphQLUserFilteringRule,
    GraphQLUserSortingRule,
    Maybe,
    UserSortingField,
} from '../definitions';

const getFilter = (rule?: Maybe<GraphQLUserFilteringRule>) => {
    const filter: Filter<User> = {};

    if (!rule) {
        return filter;
    }

    if (rule.email) {
        filter.email = '';
    }

    return filter;
};

const getSort = (rule?: Maybe<GraphQLUserSortingRule>) => {
    // always sort by ID for consistency
    const sort: Sort = { _id: 1 };

    if (!rule) {
        return sort;
    }

    switch (rule.field) {
        case UserSortingField.Email:
            return { email: getSortingValue(rule.order), ...sort };

        case UserSortingField.Authenticator:
            return { otpSetup: getSortingValue(rule.order), ...sort };

        default:
            throw new Error('Sorting field not supported');
    }
};

const query: GraphQLQueryResolvers['listUsers'] = async (root, { pagination, sort, filter }) => {
    const { collections } = await getDatabaseContext();

    return paginateAggregation(
        collections.users,
        [{ $match: getFilter(filter) }, { $sort: getSort(sort) }],
        pagination
    );
};

export default query;
