import {CnsApi} from './CnsApi';
import {DagApi} from './DagApi';
import {FileApi} from './FileApi';
import {RpcTransport} from './RpcTransport';

export class StorageNode {
    readonly dagApi: DagApi;
    readonly fileApi: FileApi;
    readonly cnsApi: CnsApi;

    constructor(readonly host: string) {
        const transport = new RpcTransport(host);

        this.dagApi = new DagApi(transport);
        this.fileApi = new FileApi(transport);
        this.cnsApi = new CnsApi(transport);
    }
}
