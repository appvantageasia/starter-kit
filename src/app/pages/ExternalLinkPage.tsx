import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRetrieveLinkQuery } from '../api';
import LoadingElement from '../components/LoadingElement';
import InternalErrorResult from '../components/results/InternalErrorResult';
import NotFoundResult from '../components/results/NotFoundResult';

export type RedirectAndReplaceProps = { state: any; path: string };

const RedirectAndReplace = ({ path, state }: RedirectAndReplaceProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(path, { state, replace: true });
    }, [navigate, state, path]);

    return null;
};

const ExternalLinkPage = () => {
    const { id } = useParams<{ id: string }>();

    const { data, loading, error } = useRetrieveLinkQuery({ fetchPolicy: 'no-cache', variables: { id } });

    if (error) {
        return <InternalErrorResult />;
    }

    const response = data?.retrieveLink;

    if (loading) {
        return <LoadingElement />;
    }

    if (!response) {
        return <NotFoundResult />;
    }

    switch (response.__typename) {
        case 'ResetPasswordLink':
            return <RedirectAndReplace path="/private/resetPassword" state={{ token: response.token }} />;

        default:
            return <InternalErrorResult />;
    }
};

export default ExternalLinkPage;
