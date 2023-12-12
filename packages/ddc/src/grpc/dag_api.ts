/* eslint-disable */
// @generated by protobuf-ts 2.9.1 with parameter long_type_number,generate_dependencies,eslint_disable
// @generated from protobuf file "dag_api.proto" (package "dag", syntax proto3)
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
 * @generated from protobuf message dag.PutRequest
 */
export interface PutRequest {
    /**
     * @generated from protobuf field: uint64 bucketId = 1 [jstype = JS_NORMAL];
     */
    bucketId: bigint;
    /**
     * @generated from protobuf field: dag.Node node = 2;
     */
    node?: Node;
    /**
     * @generated from protobuf field: optional bytes cid = 3;
     */
    cid?: Uint8Array;
}
/**
 * @generated from protobuf message dag.PutResponse
 */
export interface PutResponse {
    /**
     * @generated from protobuf field: bytes cid = 1;
     */
    cid: Uint8Array;
}
/**
 * @generated from protobuf message dag.GetRequest
 */
export interface GetRequest {
    /**
     * @generated from protobuf field: uint64 bucketId = 1 [jstype = JS_NORMAL];
     */
    bucketId: bigint;
    /**
     * @generated from protobuf field: bytes cid = 2;
     */
    cid: Uint8Array;
    /**
     * @generated from protobuf field: optional string path = 3;
     */
    path?: string;
}
/**
 * @generated from protobuf message dag.GetResponse
 */
export interface GetResponse {
    /**
     * @generated from protobuf field: dag.Node node = 1;
     */
    node?: Node;
}
/**
 * @generated from protobuf message dag.Node
 */
export interface Node {
    /**
     * @generated from protobuf field: bytes data = 1;
     */
    data: Uint8Array;
    /**
     * @generated from protobuf field: repeated dag.Link links = 2;
     */
    links: Link[];
    /**
     * @generated from protobuf field: repeated dag.Tag tags = 3;
     */
    tags: Tag[];
}
/**
 * @generated from protobuf message dag.Link
 */
export interface Link {
    /**
     * CID of the target object
     *
     * @generated from protobuf field: bytes cid = 1;
     */
    cid: Uint8Array;
    /**
     * UTF-8 string name
     *
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * cumulative size of target object
     *
     * @generated from protobuf field: uint64 size = 3;
     */
    size: number;
}
/**
 * @generated from protobuf message dag.Tag
 */
export interface Tag {
    /**
     * @generated from protobuf field: string key = 1;
     */
    key: string;
    /**
     * @generated from protobuf field: string value = 2;
     */
    value: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class PutRequest$Type extends MessageType<PutRequest> {
    constructor() {
        super("dag.PutRequest", [
            { no: 1, name: "bucketId", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 2, name: "node", kind: "message", T: () => Node },
            { no: 3, name: "cid", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PutRequest>): PutRequest {
        const message = { bucketId: 0n };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutRequest): PutRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 bucketId = 1 [jstype = JS_NORMAL];*/ 1:
                    message.bucketId = reader.uint64().toBigInt();
                    break;
                case /* dag.Node node */ 2:
                    message.node = Node.internalBinaryRead(reader, reader.uint32(), options, message.node);
                    break;
                case /* optional bytes cid */ 3:
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
    internalBinaryWrite(message: PutRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 bucketId = 1 [jstype = JS_NORMAL]; */
        if (message.bucketId !== 0n)
            writer.tag(1, WireType.Varint).uint64(message.bucketId);
        /* dag.Node node = 2; */
        if (message.node)
            Node.internalBinaryWrite(message.node, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* optional bytes cid = 3; */
        if (message.cid !== undefined)
            writer.tag(3, WireType.LengthDelimited).bytes(message.cid);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message dag.PutRequest
 */
export const PutRequest = new PutRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutResponse$Type extends MessageType<PutResponse> {
    constructor() {
        super("dag.PutResponse", [
            { no: 1, name: "cid", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PutResponse>): PutResponse {
        const message = { cid: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PutResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PutResponse): PutResponse {
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
    internalBinaryWrite(message: PutResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
 * @generated MessageType for protobuf message dag.PutResponse
 */
export const PutResponse = new PutResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetRequest$Type extends MessageType<GetRequest> {
    constructor() {
        super("dag.GetRequest", [
            { no: 1, name: "bucketId", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 2, name: "cid", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "path", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<GetRequest>): GetRequest {
        const message = { bucketId: 0n, cid: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetRequest): GetRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 bucketId = 1 [jstype = JS_NORMAL];*/ 1:
                    message.bucketId = reader.uint64().toBigInt();
                    break;
                case /* bytes cid */ 2:
                    message.cid = reader.bytes();
                    break;
                case /* optional string path */ 3:
                    message.path = reader.string();
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
    internalBinaryWrite(message: GetRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 bucketId = 1 [jstype = JS_NORMAL]; */
        if (message.bucketId !== 0n)
            writer.tag(1, WireType.Varint).uint64(message.bucketId);
        /* bytes cid = 2; */
        if (message.cid.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.cid);
        /* optional string path = 3; */
        if (message.path !== undefined)
            writer.tag(3, WireType.LengthDelimited).string(message.path);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message dag.GetRequest
 */
export const GetRequest = new GetRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetResponse$Type extends MessageType<GetResponse> {
    constructor() {
        super("dag.GetResponse", [
            { no: 1, name: "node", kind: "message", T: () => Node }
        ]);
    }
    create(value?: PartialMessage<GetResponse>): GetResponse {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetResponse): GetResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* dag.Node node */ 1:
                    message.node = Node.internalBinaryRead(reader, reader.uint32(), options, message.node);
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
    internalBinaryWrite(message: GetResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* dag.Node node = 1; */
        if (message.node)
            Node.internalBinaryWrite(message.node, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message dag.GetResponse
 */
export const GetResponse = new GetResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Node$Type extends MessageType<Node> {
    constructor() {
        super("dag.Node", [
            { no: 1, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "links", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Link },
            { no: 3, name: "tags", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Tag }
        ]);
    }
    create(value?: PartialMessage<Node>): Node {
        const message = { data: new Uint8Array(0), links: [], tags: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Node>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Node): Node {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes data */ 1:
                    message.data = reader.bytes();
                    break;
                case /* repeated dag.Link links */ 2:
                    message.links.push(Link.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated dag.Tag tags */ 3:
                    message.tags.push(Tag.internalBinaryRead(reader, reader.uint32(), options));
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
    internalBinaryWrite(message: Node, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes data = 1; */
        if (message.data.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.data);
        /* repeated dag.Link links = 2; */
        for (let i = 0; i < message.links.length; i++)
            Link.internalBinaryWrite(message.links[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* repeated dag.Tag tags = 3; */
        for (let i = 0; i < message.tags.length; i++)
            Tag.internalBinaryWrite(message.tags[i], writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message dag.Node
 */
export const Node = new Node$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Link$Type extends MessageType<Link> {
    constructor() {
        super("dag.Link", [
            { no: 1, name: "cid", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "size", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ }
        ]);
    }
    create(value?: PartialMessage<Link>): Link {
        const message = { cid: new Uint8Array(0), name: "", size: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Link>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Link): Link {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes cid */ 1:
                    message.cid = reader.bytes();
                    break;
                case /* string name */ 2:
                    message.name = reader.string();
                    break;
                case /* uint64 size */ 3:
                    message.size = reader.uint64().toNumber();
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
    internalBinaryWrite(message: Link, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes cid = 1; */
        if (message.cid.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.cid);
        /* string name = 2; */
        if (message.name !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.name);
        /* uint64 size = 3; */
        if (message.size !== 0)
            writer.tag(3, WireType.Varint).uint64(message.size);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message dag.Link
 */
export const Link = new Link$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Tag$Type extends MessageType<Tag> {
    constructor() {
        super("dag.Tag", [
            { no: 1, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<Tag>): Tag {
        const message = { key: "", value: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Tag>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Tag): Tag {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string key */ 1:
                    message.key = reader.string();
                    break;
                case /* string value */ 2:
                    message.value = reader.string();
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
    internalBinaryWrite(message: Tag, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string key = 1; */
        if (message.key !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.key);
        /* string value = 2; */
        if (message.value !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message dag.Tag
 */
export const Tag = new Tag$Type();
/**
 * @generated ServiceType for protobuf service dag.DagApi
 */
export const DagApi = new ServiceType("dag.DagApi", [
    { name: "Put", options: { "google.api.http": { post: "/v1/dag/{bucketId}", body: "*" } }, I: PutRequest, O: PutResponse },
    { name: "Get", options: { "google.api.http": { get: "/v1/dag/{bucketId}/{cid}/{path}", additionalBindings: [{ get: "/v1/dag/{bucketId}/{cid}" }] } }, I: GetRequest, O: GetResponse }
]);
