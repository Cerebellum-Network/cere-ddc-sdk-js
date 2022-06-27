import {DdcUriParser} from "./DdcUriParser.js";

export const DDC = "ddc";
export const ORG = "org";
export const BUC = "buc";
type IPIECE = "ipiece";
type IFILE = "ifile";
type PIECE = "piece";
type FILE = "file";

export const IPIECE = "ipiece";
export const IFILE = "ifile";
export const PIECE = "piece";
export const FILE = "file";

export type Protocol = IPIECE | IFILE | PIECE | FILE;

export class DdcUri {
    readonly bucket: string | bigint;
    readonly path: string | Array<string>;
    readonly protocol?: Protocol;
    readonly organization?: string;
    readonly options?: string;

    constructor(bucket: string | bigint, path: string, protocol?: IPIECE | IFILE, organization?: string, options?: string)
    constructor(bucket: string | bigint, path: string | Array<string>, protocol?: PIECE | FILE, organization?: string, options?: string)
    constructor(bucket: string | bigint, path: string | Array<string>, protocol?: Protocol, organization?: string, options?: string) {
        if (typeof path === "string" && (protocol === FILE || protocol === PIECE)) {
            throw new Error(`Unable create DdcUri with current parameters: protocol='${protocol}', path='${path}'`)
        }
        this.organization = organization;
        this.bucket = bucket;
        this.protocol = protocol;
        this.path = path;
        this.options = options;
    }

    static parse(url: URL): DdcUri;
    static parse(uri: string): DdcUri;
    static parse(bucketId: bigint, cid: string, protocol?: IPIECE | IFILE): DdcUri;
    static parse(bucketIdOrUrlOrUri: URL | string | bigint, cid?: string, protocol?: IPIECE | IFILE): DdcUri {
        if (typeof bucketIdOrUrlOrUri === "string" || bucketIdOrUrlOrUri instanceof URL) {
            return DdcUriParser.parse(bucketIdOrUrlOrUri);
        }

        return new DdcUri(bucketIdOrUrlOrUri, cid!, protocol);
    }

    toString(): string {
        const parts = new Array<string>(`/${DDC}`);

        if (this.organization) {
            parts.push(ORG, this.organization);
        }

        if (this.bucket) {
            parts.push(BUC, `${this.bucket}`);
        }

        if (this.path) {
            if (!this.protocol) {
                throw new Error("Unable to build DDC uri string without protocol");
            }

            if (this.path instanceof Array) {
                parts.push(this.protocol, ...this.path);
            } else {
                parts.push(this.protocol, this.path);
            }
        }

        let result = parts.join("/");
        if (this.options) {
            result = result + "?" + this.options;
        }

        return result;
    }

}