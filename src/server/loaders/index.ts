import createUserLoaders, { UserLoaders } from './users';

export type Loaders = UserLoaders;

const createLoaders = (): Loaders => ({
    ...createUserLoaders(),
});

export default createLoaders;
