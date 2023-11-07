// @generated by protobuf-ts 2.9.1 with parameter long_type_number
// @generated from protobuf file "file_api.proto" (package "file", syntax proto3)
// tslint:disable
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message file.PutRawPieceRequest
 */
export interface PutRawPieceRequest {
    /**
     * @generated from protobuf oneof: body
     */
    body: {
        oneofKind: "metadata";
        /**
         * @generated from protobuf field: file.PutRawPieceRequest.Metadata metadata = 1;
         */
        metadata: PutRawPieceRequest_Metadata; // first message contains piece metadata
    } | {
        oneofKind: "content";
        /**
         * @generated from protobuf field: file.PutRawPieceRequest.Content content = 2;
         */
        content: PutRawPieceRequest_Content; // subsequent messages contain only part of a raw piece data
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message file.PutRawPieceRequest.Metadata
 */
export interface PutRawPieceRequest_Metadata {
    /**
     * @generated from protobuf field: uint64 bucketId = 1;
     */
    bucketId: number;
    /**
     * @generated from protobuf field: optional bytes cid = 2;
     */
    cid?: Uint8Array;
    /**
     * @generated from protobuf field: optional uint64 offset = 3;
     */
    offset?: number; // starting offset of the piece inside a file. Should be set only if isMultipart = true
    /**
     * @generated from protobuf field: bool isMultipart = 4;
     */
    isMultipart: boolean; // whether the piece is part of a file or not
}
/**
 * @generated from protobuf message file.PutRawPieceRequest.Content
 */
export interface PutRawPieceRequest_Content {
    /**
     * @generated from protobuf field: bytes data = 1;
     */
    data: Uint8Array;
}
/**
 * @generated from protobuf message file.PutRawPieceResponse
 */
export interface PutRawPieceResponse {
    /**
     * @generated from protobuf field: bytes cid = 1;
     */
    cid: Uint8Array; // TBD
}
/**
 * @generated from protobuf message file.PutMultiPartPieceRequest
 */
export interface PutMultiPartPieceRequest {
    /**
     * @generated from protobuf field: uint64 bucketId = 1;
     */
    bucketId: number; // bucket where file is stored
    /**
     * @generated from protobuf field: optional bytes cid = 2;
     */
    cid?: Uint8Array; // root hash of the file hash tree
    /**
     * @generated from protobuf field: uint64 totalSize = 3;
     */
    totalSize: number; // size of the multi-part piece (large file total size)
    /**
     * @generated from protobuf field: uint64 partSize = 4;
     */
    partSize: number; // size of the raw piece (large file part size)
    /**
     * @generated from protobuf field: repeated bytes partHashes = 5;
     */
    partHashes: Uint8Array[]; // ordered list of the raw piece hashes
}
/**
 * @generated from protobuf message file.PutMultiPartPieceResponse
 */
export interface PutMultiPartPieceResponse {
    /**
     * @generated from protobuf field: bytes cid = 1;
     */
    cid: Uint8Array; // TBD
}
/**
 * @generated from protobuf message file.GetFileRequest
 */
export interface GetFileRequest {
    /**
     * @generated from protobuf oneof: Body
     */
    body: {
        oneofKind: "request";
        /**
         * @generated from protobuf field: file.GetFileRequest.Request request = 1;
         */
        request: GetFileRequest_Request;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message file.GetFileRequest.Request
 */
export interface GetFileRequest_Request {
    /**
     * @generated from protobuf field: bytes cid = 1;
     */
    cid: Uint8Array; // CID of either raw or multi-part piece
    /**
     * @generated from protobuf field: uint64 bucketId = 2;
     */
    bucketId: number;
    /**
     * @generated from protobuf field: optional file.GetFileRequest.Request.Range range = 3;
     */
    range?: GetFileRequest_Request_Range; // indicates part of the file to be returned (return whole file if range is missing)
}
/**
 * @generated from protobuf message file.GetFileRequest.Request.Range
 */
export interface GetFileRequest_Request_Range {
    /**
     * @generated from protobuf field: uint64 start = 1;
     */
    start: number;
    /**
     * @generated from protobuf field: uint64 end = 2;
     */
    end: number;
}
/**
 * @generated from protobuf message file.GetFileResponse
 */
export interface GetFileResponse {
    /**
     * @generated from protobuf oneof: body
     */
    body: {
        oneofKind: "proof";
        /**
         * @generated from protobuf field: file.GetFileResponse.Proof proof = 1;
         */
        proof: GetFileResponse_Proof; // first message contains only merkle proof of requested content for the root (CID)
    } | {
        oneofKind: "data";
        /**
         * @generated from protobuf field: bytes data = 2;
         */
        data: Uint8Array; // subsequent messages contain only part of a requested content
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message file.GetFileResponse.Proof
 */
export interface GetFileResponse_Proof {
    /**
     * @generated from protobuf field: repeated bytes proof = 1;
     */
    proof: Uint8Array[];
}
// @generated message type with reflection information, may provide speed optimized methods
class PutRawPieceRequest$Type extends MessageType<PutRawPieceRequest> {
    constructor() {
        super("file.PutRawPieceRequest", [
            { no: 1, name: "metadata", kind: "message", oneof: "body", T: () => PutRawPieceRequest_Metadata },
            { no: 2, name: "content", kind: "message", oneof: "body", T: () => PutRawPieceRequest_Content }
        ]);
    }
    create(value?: PartialMessage<PutRawPieceRequest>): PutRawPieceRequest {
        const message = { body: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutRawPieceRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutRawPieceRequest): PutRawPieceRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* file.PutRawPieceRequest.Metadata metadata */ 1:
                    message.body = {
                        oneofKind: "metadata",
                        metadata: PutRawPieceRequest_Metadata.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).metadata)
                    };
                    break;
                case /* file.PutRawPieceRequest.Content content */ 2:
                    message.body = {
                        oneofKind: "content",
                        content: PutRawPieceRequest_Content.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).content)
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PutRawPieceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* file.PutRawPieceRequest.Metadata metadata = 1; */
        if (message.body.oneofKind === "metadata")
            PutRawPieceRequest_Metadata.internalBinaryWrite(message.body.metadata, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* file.PutRawPieceRequest.Content content = 2; */
        if (message.body.oneofKind === "content")
            PutRawPieceRequest_Content.internalBinaryWrite(message.body.content, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.PutRawPieceRequest
 */
export const PutRawPieceRequest = new PutRawPieceRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutRawPieceRequest_Metadata$Type extends MessageType<PutRawPieceRequest_Metadata> {
    constructor() {
        super("file.PutRawPieceRequest.Metadata", [
            { no: 1, name: "bucketId", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "cid", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "offset", kind: "scalar", opt: true, T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 4, name: "isMultipart", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<PutRawPieceRequest_Metadata>): PutRawPieceRequest_Metadata {
        const message = { bucketId: 0, isMultipart: false };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutRawPieceRequest_Metadata>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutRawPieceRequest_Metadata): PutRawPieceRequest_Metadata {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 bucketId */ 1:
                    message.bucketId = reader.uint64().toNumber();
                    break;
                case /* optional bytes cid */ 2:
                    message.cid = reader.bytes();
                    break;
                case /* optional uint64 offset */ 3:
                    message.offset = reader.uint64().toNumber();
                    break;
                case /* bool isMultipart */ 4:
                    message.isMultipart = reader.bool();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PutRawPieceRequest_Metadata, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 bucketId = 1; */
        if (message.bucketId !== 0)
            writer.tag(1, WireType.Varint).uint64(message.bucketId);
        /* optional bytes cid = 2; */
        if (message.cid !== undefined)
            writer.tag(2, WireType.LengthDelimited).bytes(message.cid);
        /* optional uint64 offset = 3; */
        if (message.offset !== undefined)
            writer.tag(3, WireType.Varint).uint64(message.offset);
        /* bool isMultipart = 4; */
        if (message.isMultipart !== false)
            writer.tag(4, WireType.Varint).bool(message.isMultipart);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.PutRawPieceRequest.Metadata
 */
export const PutRawPieceRequest_Metadata = new PutRawPieceRequest_Metadata$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutRawPieceRequest_Content$Type extends MessageType<PutRawPieceRequest_Content> {
    constructor() {
        super("file.PutRawPieceRequest.Content", [
            { no: 1, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PutRawPieceRequest_Content>): PutRawPieceRequest_Content {
        const message = { data: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutRawPieceRequest_Content>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutRawPieceRequest_Content): PutRawPieceRequest_Content {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes data */ 1:
                    message.data = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PutRawPieceRequest_Content, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes data = 1; */
        if (message.data.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.data);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.PutRawPieceRequest.Content
 */
export const PutRawPieceRequest_Content = new PutRawPieceRequest_Content$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutRawPieceResponse$Type extends MessageType<PutRawPieceResponse> {
    constructor() {
        super("file.PutRawPieceResponse", [
            { no: 1, name: "cid", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PutRawPieceResponse>): PutRawPieceResponse {
        const message = { cid: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutRawPieceResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutRawPieceResponse): PutRawPieceResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes cid */ 1:
                    message.cid = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PutRawPieceResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes cid = 1; */
        if (message.cid.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.cid);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.PutRawPieceResponse
 */
export const PutRawPieceResponse = new PutRawPieceResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutMultiPartPieceRequest$Type extends MessageType<PutMultiPartPieceRequest> {
    constructor() {
        super("file.PutMultiPartPieceRequest", [
            { no: 1, name: "bucketId", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "cid", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "totalSize", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 4, name: "partSize", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 5, name: "partHashes", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PutMultiPartPieceRequest>): PutMultiPartPieceRequest {
        const message = { bucketId: 0, totalSize: 0, partSize: 0, partHashes: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutMultiPartPieceRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutMultiPartPieceRequest): PutMultiPartPieceRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 bucketId */ 1:
                    message.bucketId = reader.uint64().toNumber();
                    break;
                case /* optional bytes cid */ 2:
                    message.cid = reader.bytes();
                    break;
                case /* uint64 totalSize */ 3:
                    message.totalSize = reader.uint64().toNumber();
                    break;
                case /* uint64 partSize */ 4:
                    message.partSize = reader.uint64().toNumber();
                    break;
                case /* repeated bytes partHashes */ 5:
                    message.partHashes.push(reader.bytes());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PutMultiPartPieceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 bucketId = 1; */
        if (message.bucketId !== 0)
            writer.tag(1, WireType.Varint).uint64(message.bucketId);
        /* optional bytes cid = 2; */
        if (message.cid !== undefined)
            writer.tag(2, WireType.LengthDelimited).bytes(message.cid);
        /* uint64 totalSize = 3; */
        if (message.totalSize !== 0)
            writer.tag(3, WireType.Varint).uint64(message.totalSize);
        /* uint64 partSize = 4; */
        if (message.partSize !== 0)
            writer.tag(4, WireType.Varint).uint64(message.partSize);
        /* repeated bytes partHashes = 5; */
        for (let i = 0; i < message.partHashes.length; i++)
            writer.tag(5, WireType.LengthDelimited).bytes(message.partHashes[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.PutMultiPartPieceRequest
 */
export const PutMultiPartPieceRequest = new PutMultiPartPieceRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutMultiPartPieceResponse$Type extends MessageType<PutMultiPartPieceResponse> {
    constructor() {
        super("file.PutMultiPartPieceResponse", [
            { no: 1, name: "cid", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PutMultiPartPieceResponse>): PutMultiPartPieceResponse {
        const message = { cid: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutMultiPartPieceResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutMultiPartPieceResponse): PutMultiPartPieceResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes cid */ 1:
                    message.cid = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PutMultiPartPieceResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes cid = 1; */
        if (message.cid.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.cid);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.PutMultiPartPieceResponse
 */
export const PutMultiPartPieceResponse = new PutMultiPartPieceResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetFileRequest$Type extends MessageType<GetFileRequest> {
    constructor() {
        super("file.GetFileRequest", [
            { no: 1, name: "request", kind: "message", oneof: "body", T: () => GetFileRequest_Request }
        ]);
    }
    create(value?: PartialMessage<GetFileRequest>): GetFileRequest {
        const message = { body: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetFileRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetFileRequest): GetFileRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* file.GetFileRequest.Request request */ 1:
                    message.body = {
                        oneofKind: "request",
                        request: GetFileRequest_Request.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).request)
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetFileRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* file.GetFileRequest.Request request = 1; */
        if (message.body.oneofKind === "request")
            GetFileRequest_Request.internalBinaryWrite(message.body.request, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.GetFileRequest
 */
export const GetFileRequest = new GetFileRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetFileRequest_Request$Type extends MessageType<GetFileRequest_Request> {
    constructor() {
        super("file.GetFileRequest.Request", [
            { no: 1, name: "cid", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "bucketId", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 3, name: "range", kind: "message", T: () => GetFileRequest_Request_Range }
        ]);
    }
    create(value?: PartialMessage<GetFileRequest_Request>): GetFileRequest_Request {
        const message = { cid: new Uint8Array(0), bucketId: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetFileRequest_Request>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetFileRequest_Request): GetFileRequest_Request {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes cid */ 1:
                    message.cid = reader.bytes();
                    break;
                case /* uint64 bucketId */ 2:
                    message.bucketId = reader.uint64().toNumber();
                    break;
                case /* optional file.GetFileRequest.Request.Range range */ 3:
                    message.range = GetFileRequest_Request_Range.internalBinaryRead(reader, reader.uint32(), options, message.range);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetFileRequest_Request, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes cid = 1; */
        if (message.cid.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.cid);
        /* uint64 bucketId = 2; */
        if (message.bucketId !== 0)
            writer.tag(2, WireType.Varint).uint64(message.bucketId);
        /* optional file.GetFileRequest.Request.Range range = 3; */
        if (message.range)
            GetFileRequest_Request_Range.internalBinaryWrite(message.range, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.GetFileRequest.Request
 */
export const GetFileRequest_Request = new GetFileRequest_Request$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetFileRequest_Request_Range$Type extends MessageType<GetFileRequest_Request_Range> {
    constructor() {
        super("file.GetFileRequest.Request.Range", [
            { no: 1, name: "start", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "end", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ }
        ]);
    }
    create(value?: PartialMessage<GetFileRequest_Request_Range>): GetFileRequest_Request_Range {
        const message = { start: 0, end: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetFileRequest_Request_Range>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetFileRequest_Request_Range): GetFileRequest_Request_Range {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 start */ 1:
                    message.start = reader.uint64().toNumber();
                    break;
                case /* uint64 end */ 2:
                    message.end = reader.uint64().toNumber();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetFileRequest_Request_Range, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 start = 1; */
        if (message.start !== 0)
            writer.tag(1, WireType.Varint).uint64(message.start);
        /* uint64 end = 2; */
        if (message.end !== 0)
            writer.tag(2, WireType.Varint).uint64(message.end);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.GetFileRequest.Request.Range
 */
export const GetFileRequest_Request_Range = new GetFileRequest_Request_Range$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetFileResponse$Type extends MessageType<GetFileResponse> {
    constructor() {
        super("file.GetFileResponse", [
            { no: 1, name: "proof", kind: "message", oneof: "body", T: () => GetFileResponse_Proof },
            { no: 2, name: "data", kind: "scalar", oneof: "body", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<GetFileResponse>): GetFileResponse {
        const message = { body: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetFileResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetFileResponse): GetFileResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* file.GetFileResponse.Proof proof */ 1:
                    message.body = {
                        oneofKind: "proof",
                        proof: GetFileResponse_Proof.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).proof)
                    };
                    break;
                case /* bytes data */ 2:
                    message.body = {
                        oneofKind: "data",
                        data: reader.bytes()
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetFileResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* file.GetFileResponse.Proof proof = 1; */
        if (message.body.oneofKind === "proof")
            GetFileResponse_Proof.internalBinaryWrite(message.body.proof, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* bytes data = 2; */
        if (message.body.oneofKind === "data")
            writer.tag(2, WireType.LengthDelimited).bytes(message.body.data);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.GetFileResponse
 */
export const GetFileResponse = new GetFileResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetFileResponse_Proof$Type extends MessageType<GetFileResponse_Proof> {
    constructor() {
        super("file.GetFileResponse.Proof", [
            { no: 1, name: "proof", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<GetFileResponse_Proof>): GetFileResponse_Proof {
        const message = { proof: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetFileResponse_Proof>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetFileResponse_Proof): GetFileResponse_Proof {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated bytes proof */ 1:
                    message.proof.push(reader.bytes());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetFileResponse_Proof, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated bytes proof = 1; */
        for (let i = 0; i < message.proof.length; i++)
            writer.tag(1, WireType.LengthDelimited).bytes(message.proof[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message file.GetFileResponse.Proof
 */
export const GetFileResponse_Proof = new GetFileResponse_Proof$Type();
/**
 * @generated ServiceType for protobuf service file.FileApi
 */
export const FileApi = new ServiceType("file.FileApi", [
    { name: "putRawPiece", clientStreaming: true, options: {}, I: PutRawPieceRequest, O: PutRawPieceResponse },
    { name: "putMultipartPiece", options: {}, I: PutMultiPartPieceRequest, O: PutMultiPartPieceResponse },
    { name: "getFile", serverStreaming: true, clientStreaming: true, options: {}, I: GetFileRequest, O: GetFileResponse }
]);
