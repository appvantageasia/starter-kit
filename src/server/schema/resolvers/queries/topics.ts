import { SortOptionObject } from 'mongodb';
import { getDatabaseContext, Topic } from '../../../database';
import { GraphQLQueryResolvers } from '../definitions';
import { SortingOrder, TopicSortingField } from '../enums';

type TopicSorting = {
    field: TopicSortingField;
    order: SortingOrder;
};

const getSorting = (sorting?: TopicSorting): SortOptionObject<Topic> => {
    const order = sorting?.order === SortingOrder.Asc ? 1 : -1;

    switch (sorting?.field) {
        case TopicSortingField.CreateDate:
            return { createdAt: order };

        case TopicSortingField.UpdateDate:
        default:
            return { updatedAt: order };
    }
};

const query: GraphQLQueryResolvers['topics'] = async (root, { pagination, sorting }) => {
    const { collections } = await getDatabaseContext();

    let cursor = collections.topics.find({}, { sort: getSorting(sorting) });

    if (pagination) {
        cursor = cursor.skip(pagination.offset).limit(pagination.limit);
    }

    return cursor.toArray();
};

export default query;
