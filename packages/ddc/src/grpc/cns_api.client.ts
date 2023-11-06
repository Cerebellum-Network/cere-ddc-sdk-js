// @generated by protobuf-ts 2.9.1 with parameter long_type_number
// @generated from protobuf file "cns_api.proto" (package "cns", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { CnsApi } from "./cns_api";
import type { GetResponse } from "./cns_api";
import type { GetRequest } from "./cns_api";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { PutResponse } from "./cns_api";
import type { PutRequest } from "./cns_api";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service cns.CnsApi
 */
export interface ICnsApiClient {
    /**
     * @generated from protobuf rpc: Put(cns.PutRequest) returns (cns.PutResponse);
     */
    put(input: PutRequest, options?: RpcOptions): UnaryCall<PutRequest, PutResponse>;
    /**
     * @generated from protobuf rpc: Get(cns.GetRequest) returns (cns.GetResponse);
     */
    get(input: GetRequest, options?: RpcOptions): UnaryCall<GetRequest, GetResponse>;
}
/**
 * @generated from protobuf service cns.CnsApi
 */
export class CnsApiClient implements ICnsApiClient, ServiceInfo {
    typeName = CnsApi.typeName;
    methods = CnsApi.methods;
    options = CnsApi.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: Put(cns.PutRequest) returns (cns.PutResponse);
     */
    put(input: PutRequest, options?: RpcOptions): UnaryCall<PutRequest, PutResponse> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<PutRequest, PutResponse>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Get(cns.GetRequest) returns (cns.GetResponse);
     */
    get(input: GetRequest, options?: RpcOptions): UnaryCall<GetRequest, GetResponse> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<GetRequest, GetResponse>("unary", this._transport, method, opt, input);
    }
}