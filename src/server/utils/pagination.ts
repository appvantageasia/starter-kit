import { FindCursor } from 'mongodb';

export type Page<TResult> = {
    items: TResult[];
    count: number;
};

export type PageInput = {
    limit: number;
    offset: number;
};

export const paginate = async <TResult>(cursor: FindCursor<TResult>, { limit, offset }): Promise<Page<TResult>> => {
    const count = await cursor.count();
    const items = await cursor.limit(limit).skip(offset).toArray();

    return { count, items };
};
