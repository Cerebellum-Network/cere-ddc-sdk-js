import {BUC, DdcUri, FILE, IFILE, IPIECE, ORG, PIECE, Protocol} from "./DdcUri.js";

const DDC_PREFIX = "/ddc/";

export class DdcUriParser {

    parse(url: string | URL): DdcUri {
        let uri, options: string;
        if (url instanceof URL) {
            uri = url.pathname;
            options = url.search;
        } else {
            [uri, options] = url.trim().split("?", 2);
        }

        if (!uri.startsWith(DDC_PREFIX) && !new URL(url).pathname.startsWith(DDC_PREFIX)) {
            throw new Error(`Invalid DDC Uri: '${url}'`)
        }

        return this.consume(uri.split(DDC_PREFIX, 2)[1], options);
    }

    private consume(uri: string, options: string): DdcUri {
        const parts = uri.split("/");

        // Keep order of parsing
        const org = this.consumeOrg(parts);
        const bucket = this.consumeBucket(parts);
        const protocol = this.consumeProtocol(parts);
        const path = this.consumePath(protocol, parts);

        // @ts-ignore
        return new DdcUri(bucket, protocol, path, org, options)
    }

    private consumeOrg(parts: Array<string>): string | undefined {
        if (parts.length >= 2 && parts[0] === ORG) {
            parts.shift();
            return parts.shift() || "";
        }
    }

    private consumeBucket(parts: Array<string>): string | bigint {
        if (parts.length >= 2 && parts[0] === BUC) {
            parts.shift();
            const value = parts.shift() || "";

            if (!isNaN(Number(value))) {
                return BigInt(Number(value));
            } else {
                return value;
            }
        }

        throw new Error("DDC Uri doesn't have bucket");
    }

    private consumeProtocol(parts: Array<string>): Protocol {
        if (parts.length >= 2) {
            const protocol = parts.shift();

            if (protocol !== IPIECE && protocol !== IFILE && protocol !== PIECE && protocol !== FILE) {
                throw new Error(`Invalid protocol: '${protocol}'`);
            }

            return protocol;
        }

        throw new Error("DDC Uri doesn't have protocol");
    }

    private consumePath(protocol: Protocol, parts: Array<string>): string | Array<string> {
        if (protocol === FILE || protocol === PIECE) {
            return parts;
        }

        const path = parts.shift();

        if (!path || parts.length > 0) {
            throw new Error("Invalid DDC Uri");
        }

        return path;
    }

}