# Database

For the database [MongoDB][mongo] is used with its native NodeJS driver.

The database is organized in the `src/server/database` directory.

-   TypeScript types for the collections are grouped in the `documents` directory
-   Data migration are grouped in the `migrations` directory
-   Collections are listed in `collections.ts`

[mongo]: https://www.mongodb.com/

The database context may be retrieved by calling `getDatabaseContext` such as :

```typescript
import { getDatabaseContext } from './database';

const getHeadlineTitles = async () => {
    const { collections, db, mongoClient } = await getDatabaseContext();

    // mongoClient is the mongo client instance
    // db is the database instance
    // collections is the mapped and typed collections
    // allowing us to do something such as
    return collections.headlines
        .find({})
        .map(headline => headline.title)
        .toArray();
};
```

## Example - New collection

First you must define the TypeScript type in the `documents` directory.

Here we create a document for headline in `Headline.ts`

```typescript
import { ObjectId } from 'mongodb';

export type Headline = {
    _id: ObjectId;
    title: string;
    body: string;
    date: Date;
};
```

Then export it from `src/server/database/documents/index.ts`

```typescript
// add the following line
export * from './Headline';
```

Then conclude by adding the new collection in `collections.ts`

```typescript
import { Collection, Db } from 'mongodb';
import * as documents from './documents';

export type Collections = {
    // add our new collection in the type
    headlines: Collection<documents.Headline>;
};

export const getCollections = (db: Db): Collections => ({
    // add a new line here to provide the collection from the database instance
    headlines: db.collection<documents.Headline>('headlines'),
});
```

## Example - New data migration

Data migrations are grouped in the `migrations` directory.
Each migration has a unique identifier.
Migrations are grouped in a list for which the order matters :
listed from the oldest to latest and executed in that order.

First create a new file such as `42_addDummyField.ts` would be

```typescript
import { Db } from 'mongodb';

export default {
    identifier: '42_addDummyField',

    async up(db: Db): Promise<void> {
        // here execute whatever your migration needs to do
    },
};
```

You may list your migrations with others in `src/server/database/migrations/index.ts` :

```typescript
import { Db } from 'mongodb';
// import your new migration
import addDummyField from './42_addDummyField';

export interface Migration {
    identifier: string;
    up: (db: Db) => Promise<void>;
}

const migrations: Migration[] = [
    // append your new migration
    addDummyField,
];

export default migrations;
```

Your migration is now ready to be executed.
