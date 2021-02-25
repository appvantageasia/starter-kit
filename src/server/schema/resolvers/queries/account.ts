import { User } from '../../../database';
import { RootResolver } from '../../context';

const query: RootResolver = async (root, args, { getUser }): Promise<User | null> => getUser();

export default query;
