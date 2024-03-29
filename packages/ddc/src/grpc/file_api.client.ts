/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,generate_dependencies,eslint_disable
// @generated from protobuf file "file_api.proto" (package "file", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { FileApi } from "./file_api";
import type { GetFileResponse } from "./file_api";
import type { GetFileRequest } from "./file_api";
import type { DuplexStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { PutMultiPartPieceResponse } from "./file_api";
import type { PutMultiPartPieceRequest } from "./file_api";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { PutRawPieceResponse } from "./file_api";
import type { PutRawPieceRequest } from "./file_api";
import type { ClientStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service file.FileApi
 */
export interface IFileApiClient {
    /**
     * @generated from protobuf rpc: putRawPiece(stream file.PutRawPieceRequest) returns (file.PutRawPieceResponse);
     */
    putRawPiece(options?: RpcOptions): ClientStreamingCall<PutRawPieceRequest, PutRawPieceResponse>;
    /**
     * @generated from protobuf rpc: putMultipartPiece(file.PutMultiPartPieceRequest) returns (file.PutMultiPartPieceResponse);
     */
    putMultipartPiece(input: PutMultiPartPieceRequest, options?: RpcOptions): UnaryCall<PutMultiPartPieceRequest, PutMultiPartPieceResponse>;
    /**
     * @generated from protobuf rpc: getFile(stream file.GetFileRequest) returns (stream file.GetFileResponse);
     */
    getFile(options?: RpcOptions): DuplexStreamingCall<GetFileRequest, GetFileResponse>;
}
/**
 * @generated from protobuf service file.FileApi
 */
export class FileApiClient implements IFileApiClient, ServiceInfo {
    typeName = FileApi.typeName;
    methods = FileApi.methods;
    options = FileApi.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: putRawPiece(stream file.PutRawPieceRequest) returns (file.PutRawPieceResponse);
     */
    putRawPiece(options?: RpcOptions): ClientStreamingCall<PutRawPieceRequest, PutRawPieceResponse> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<PutRawPieceRequest, PutRawPieceResponse>("clientStreaming", this._transport, method, opt);
    }
    /**
     * @generated from protobuf rpc: putMultipartPiece(file.PutMultiPartPieceRequest) returns (file.PutMultiPartPieceResponse);
     */
    putMultipartPiece(input: PutMultiPartPieceRequest, options?: RpcOptions): UnaryCall<PutMultiPartPieceRequest, PutMultiPartPieceResponse> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<PutMultiPartPieceRequest, PutMultiPartPieceResponse>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: getFile(stream file.GetFileRequest) returns (stream file.GetFileResponse);
     */
    getFile(options?: RpcOptions): DuplexStreamingCall<GetFileRequest, GetFileResponse> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<GetFileRequest, GetFileResponse>("duplex", this._transport, method, opt);
    }
}
