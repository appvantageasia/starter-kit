import join from 'url-join';
import { useRuntimeConfig } from '../runtimeConfig';

const usePublic = (assetPath: string) => {
    const { publicPath } = useRuntimeConfig();

    return join(publicPath, assetPath);
};

export default usePublic;
