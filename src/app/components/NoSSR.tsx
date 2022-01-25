import { useEffect, useState, useLayoutEffect } from 'react';

type NoSSRProps = {
    children: JSX.Element;
    defer?: boolean;
};

const useEnhancedEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const NoSSR = ({ children, defer = false }: NoSSRProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), [setMounted]);

    const [mountedState, setMountedState] = useState(false);

    useEnhancedEffect(() => {
        if (!defer) {
            setMountedState(true);
        }
    }, [defer]);

    useEffect(() => {
        if (defer) {
            setMountedState(true);
        }
    }, [defer]);

    if (!mounted) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{mountedState ? children : null}</>;
};

export default NoSSR;
