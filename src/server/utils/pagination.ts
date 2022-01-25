import { getOr } from 'lodash/fp';
import { Collection, SortDirection, Filter, Document } from 'mongodb';
import { SortingOrder } from '../schema/resolvers/enums';

export type Page<TResult> = {
    items: TResult[];
    count: number;
};

export type PageInput = {
    limit: number;
    offset: number;
};

export const paginateAggregation = async <TDocument>(
    collection: Collection<TDocument>,
    pipelines: Document[],
    { limit, offset }: PageInput
): Promise<Page<TDocument>> => {
    const [{ metadata, items }] = await collection
        .aggregate([
            ...pipelines,
            {
                $facet: {
                    metadata: [{ $count: 'count' }],
                    items: [{ $skip: offset }, { $limit: limit }],
                },
            },
        ])
        .toArray();

    return { count: getOr(0, '[0].count', metadata), items };
};

export const paginate = async <TDocument>(
    collection: Collection<TDocument>,
    filter: Filter<TDocument>,
    page: PageInput
) => paginateAggregation<TDocument>(collection, [{ $match: filter }], page);

export const getSortingValue = (order: SortingOrder): SortDirection => {
    switch (order) {
        case SortingOrder.Asc:
            return 1;

        case SortingOrder.Desc:
            return -1;

        default:
            throw new Error('Sorting order not implemented');
    }
};
