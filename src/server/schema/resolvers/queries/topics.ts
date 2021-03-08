import { SortOptionObject } from 'mongodb';
import { getDatabaseContext, Topic } from '../../../database';
import { RootResolver } from '../../context';
import { SortingOrder, TopicSortingField } from '../enums';
import { Pagination } from '../inputs';

type TopicSorting = {
    field: TopicSortingField;
    order: SortingOrder;
};

export type Args = { pagination?: Pagination; sorting?: TopicSorting };

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

const query: RootResolver<Args> = async (root, { pagination, sorting }): Promise<Topic[]> => {
    const { collections } = await getDatabaseContext();

    let cursor = collections.topics.find({}, { sort: getSorting(sorting) });

    if (pagination) {
        cursor = cursor.skip(pagination.offset).limit(pagination.limit);
    }

    return cursor.toArray();
};

export default query;
