/* eslint-disable */
// @generated by protobuf-ts 2.9.1 with parameter long_type_number,generate_dependencies,eslint_disable
// @generated from protobuf file "auth_token.proto" (syntax proto3)
// tslint:disable
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
import { Signature } from "./common/signature";
/**
 * Token represents trust chain of tokens where first token is verifiable by bucket access on chain and last token is generated by the client that sends a request
 *
 * @generated from protobuf message AuthToken
 */
export interface AuthToken {
    /**
     * @generated from protobuf field: common.Signature signature = 1;
     */
    signature?: Signature; // signature signer is an issuer. issuer of first token should have an access on pallet level and subsequent tokens can skip 'issuer' and take 'subject' from previous token to verify signature
    /**
     * @generated from protobuf field: Payload payload = 2;
     */
    payload?: Payload;
}
/**
 * @generated from protobuf message Payload
 */
export interface Payload {
    /**
     * @generated from protobuf field: optional AuthToken prev = 1;
     */
    prev?: AuthToken; // prev token in trust chain (based on known use cases max depth can be limited to 3 or increase to 5 to support more potential use cases)
    /**
     * @generated from protobuf field: optional bytes subject = 2;
     */
    subject?: Uint8Array; // whom. every except last token should be non empty. next token should be signed by this subject
    /**
     * @generated from protobuf field: optional bool canDelegate = 3;
     */
    canDelegate?: boolean; // subject can be prohibited to delegate access to anyone else (next token should be last)
    /**
     * @generated from protobuf field: optional uint64 bucketId = 4 [jstype = JS_NORMAL];
     */
    bucketId?: bigint; // mentioned only once in trust chain (or even not mentioned at all if bucket owner decided to share access to all his buckets)
    /**
     * @generated from protobuf field: repeated Operation operations = 5;
     */
    operations: Operation[]; // each next token in trust chain should have less or equal privileges (e.g. token restricted to 'get' operation can't have 'put' in next token)
    /**
     * @generated from protobuf field: optional int64 expiresAt = 6;
     */
    expiresAt?: number; // each next token should expires earlier or at the same time as previous one (e.g. token can't have lower expiresAt than in next token)
    /**
     * @generated from protobuf field: optional bytes pieceCid = 7;
     */
    pieceCid?: Uint8Array; // mentioned only once in trust chain (in DAG API nested pieces can be accessed by path)
}
/**
 * @generated from protobuf enum Operation
 */
export enum Operation {
    /**
     * @generated from protobuf enum value: UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: PUT = 1;
     */
    PUT = 1,
    /**
     * @generated from protobuf enum value: GET = 2;
     */
    GET = 2,
    /**
     * @generated from protobuf enum value: DELETE = 3;
     */
    DELETE = 3
}
// @generated message type with reflection information, may provide speed optimized methods
class AuthToken$Type extends MessageType<AuthToken> {
    constructor() {
        super("AuthToken", [
            { no: 1, name: "signature", kind: "message", T: () => Signature },
            { no: 2, name: "payload", kind: "message", T: () => Payload }
        ]);
    }
    create(value?: PartialMessage<AuthToken>): AuthToken {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<AuthToken>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AuthToken): AuthToken {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.Signature signature */ 1:
                    message.signature = Signature.internalBinaryRead(reader, reader.uint32(), options, message.signature);
                    break;
                case /* Payload payload */ 2:
                    message.payload = Payload.internalBinaryRead(reader, reader.uint32(), options, message.payload);
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
    internalBinaryWrite(message: AuthToken, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.Signature signature = 1; */
        if (message.signature)
            Signature.internalBinaryWrite(message.signature, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* Payload payload = 2; */
        if (message.payload)
            Payload.internalBinaryWrite(message.payload, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message AuthToken
 */
export const AuthToken = new AuthToken$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Payload$Type extends MessageType<Payload> {
    constructor() {
        super("Payload", [
            { no: 1, name: "prev", kind: "message", T: () => AuthToken },
            { no: 2, name: "subject", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "canDelegate", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 4, name: "bucketId", kind: "scalar", opt: true, T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 5, name: "operations", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["Operation", Operation] },
            { no: 6, name: "expiresAt", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 7, name: "pieceCid", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<Payload>): Payload {
        const message = { operations: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Payload>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Payload): Payload {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* optional AuthToken prev */ 1:
                    message.prev = AuthToken.internalBinaryRead(reader, reader.uint32(), options, message.prev);
                    break;
                case /* optional bytes subject */ 2:
                    message.subject = reader.bytes();
                    break;
                case /* optional bool canDelegate */ 3:
                    message.canDelegate = reader.bool();
                    break;
                case /* optional uint64 bucketId = 4 [jstype = JS_NORMAL];*/ 4:
                    message.bucketId = reader.uint64().toBigInt();
                    break;
                case /* repeated Operation operations */ 5:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.operations.push(reader.int32());
                    else
                        message.operations.push(reader.int32());
                    break;
                case /* optional int64 expiresAt */ 6:
                    message.expiresAt = reader.int64().toNumber();
                    break;
                case /* optional bytes pieceCid */ 7:
                    message.pieceCid = reader.bytes();
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
    internalBinaryWrite(message: Payload, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* optional AuthToken prev = 1; */
        if (message.prev)
            AuthToken.internalBinaryWrite(message.prev, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* optional bytes subject = 2; */
        if (message.subject !== undefined)
            writer.tag(2, WireType.LengthDelimited).bytes(message.subject);
        /* optional bool canDelegate = 3; */
        if (message.canDelegate !== undefined)
            writer.tag(3, WireType.Varint).bool(message.canDelegate);
        /* optional uint64 bucketId = 4 [jstype = JS_NORMAL]; */
        if (message.bucketId !== undefined)
            writer.tag(4, WireType.Varint).uint64(message.bucketId);
        /* repeated Operation operations = 5; */
        if (message.operations.length) {
            writer.tag(5, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.operations.length; i++)
                writer.int32(message.operations[i]);
            writer.join();
        }
        /* optional int64 expiresAt = 6; */
        if (message.expiresAt !== undefined)
            writer.tag(6, WireType.Varint).int64(message.expiresAt);
        /* optional bytes pieceCid = 7; */
        if (message.pieceCid !== undefined)
            writer.tag(7, WireType.LengthDelimited).bytes(message.pieceCid);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message Payload
 */
export const Payload = new Payload$Type();