import * as Sentry from '@sentry/react';
import { Component, ReactNode, ComponentType, ReactElement } from 'react';
import InternalErrorResult from '../components/results/InternalErrorResult';

export type ErrorBoundaryProps = {
    children: JSX.Element | ReactNode | ReactElement;
    cacheKey?: string;
};

export type ErrorBoundaryState = {
    hasError: boolean;
    cacheKey?: string;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, cacheKey: props.cacheKey };
    }

    static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState) {
        if (props.cacheKey !== state.cacheKey) {
            // reset the boundary
            return { hasError: false, cacheKey: props.cacheKey };
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

        // update state
        // eslint-disable-next-line react/destructuring-assignment
        this.setState({ cacheKey: this.props.cacheKey, hasError: true });
    }

    render() {
        const { hasError } = this.state;

        if (hasError) {
            return <InternalErrorResult />;
        }

        const { children } = this.props;

        return children;
    }
}

export default ErrorBoundary;

export const withErrorBoundary = <Props extends {} = {}>(
    WrappedComponent: ComponentType<Props>
): ComponentType<Props> => {
    const enhancedComponent = props => (
        <ErrorBoundary>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    enhancedComponent.displayName = `withErrorBoundary(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return enhancedComponent;
};
