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
    readonly protocol: Protocol;
    readonly path: string | Array<string>;
    readonly organization?: string;
    readonly options?: string;


    constructor(bucket: string | bigint, protocol: IPIECE | IFILE, path: string | Array<string>, organization?: string, options?: string)
    constructor(bucket: string | bigint, protocol: PIECE | FILE, path: Array<string>, organization?: string, options?: string)
    constructor(bucket: string | bigint, protocol: Protocol, path: string | Array<string>, organization?: string, options?: string) {
        if (typeof path === "string" && (protocol !== "ipiece" && protocol !== "ifile")) {
            throw new Error(`Unable create DdcUri with current parameters: protocol='${protocol}', path='${path}'`)
        }
        this.organization = organization;
        this.bucket = bucket;
        this.protocol = protocol;
        this.path = path;
        this.options = options;
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