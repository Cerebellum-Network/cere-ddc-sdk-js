import {Link} from '../models/Link';
import {PieceUri} from '../models/PieceUri';
import {Route} from './Route';

export interface RouterInterface {
    getReadRoute(uri: PieceUri): Promise<Route>;
    getStoreRoute(uri: PieceUri, links: Link[]): Promise<Route>;
    getSearchRoute(bucketId: PieceUri['bucketId']): Promise<Route>;
}
