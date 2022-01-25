import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useGoTo = (location: string, state?: any) => {
    const navigate = useNavigate();

    return useCallback(() => {
        navigate(location, { state });
    }, [location, state, navigate]);
};

export default useGoTo;
