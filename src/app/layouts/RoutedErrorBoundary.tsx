import * as Sentry from '@sentry/react';
import { Component, ReactNode, ComponentType } from 'react';
import { useHistory } from 'react-router-dom';
import ErrorPage from '../pages/ErrorPage';

export type Props = {
    pathname: string | null;
    children: JSX.Element | ReactNode;
};

export type State = {
    hasError: boolean;
    pathname: string | null;
};

class RoutedErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, pathname: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.pathname !== state.pathname) {
            return { hasError: false, pathname: props.pathname };
        }

        return state;
    }

    componentDidCatch(error, errorInfo) {
        if (!process.isDev) {
            // print the error
            // do not print on development to avoid printing twice in console
            console.error(error);
        }

        // and capture it
        Sentry.captureException(error);
    }

    render() {
        const { hasError } = this.state;

        if (hasError) {
            return <ErrorPage />;
        }

        const { children } = this.props;

        return children;
    }
}

export default RoutedErrorBoundary;

export const withErrorBoundary = <Props extends {} = {}>(
    WrappedComponent: ComponentType<Props>
): ComponentType<Props> => {
    const enhancedComponent = props => {
        const history = useHistory();

        if (!process.browser) {
            // do not generate error boundary
            return <WrappedComponent {...props} />;
        }

        return (
            <RoutedErrorBoundary pathname={history.location.pathname}>
                <WrappedComponent {...props} />
            </RoutedErrorBoundary>
        );
    };

    enhancedComponent.displayName = `withErrorBoundary(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return enhancedComponent;
};
