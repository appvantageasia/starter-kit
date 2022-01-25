export const createJWTStorage = <Data>(storageKey: string) => ({
    set: (data: Data, rootMode: boolean = false) => {
        if (typeof window === 'undefined') {
            throw new Error('Local storage not available in SSR');
        }

        // serialize data so it can fit in the storage
        const serializedData = JSON.stringify(data);

        if (rootMode) {
            // on root mode, the local storage will forward the focus into the session storage
            localStorage.setItem(storageKey, '__in_session_storage__');
            // set real data in session storage instead
            sessionStorage.setItem(storageKey, serializedData);
        } else {
            // directly push data in local storage if we do not use root mode
            localStorage.setItem(storageKey, serializedData);
        }
    },
    get: (): Data | null => {
        if (typeof window === 'undefined') {
            return null;
        }

        // get data at first from local storage
        let serializedData = localStorage.getItem(storageKey);

        // look for the constant pushed by root mode
        if (serializedData === '__in_session_storage__') {
            // get data from session storage instead
            serializedData = sessionStorage.getItem(storageKey);
        }

        if (serializedData) {
            // if there is data, we are going to parse it back
            return JSON.parse(serializedData);
        }

        return null;
    },
    unset: () => {
        if (typeof window === 'undefined') {
            throw new Error('Local storage not available in SSR');
        }

        // either way, unset for both local & session storages
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
    },
});

export const sessionJWTStorage = createJWTStorage<string>('app:session');
