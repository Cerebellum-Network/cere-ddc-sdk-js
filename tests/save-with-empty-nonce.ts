import {DdcClient, DdcUri, IPIECE, Piece, StoreOptions, Tag} from '@cere-ddc-sdk/ddc-client';
import nacl from 'tweetnacl';
import {u8aToHex} from '@polkadot/util';
import {Session} from "@cere-ddc-sdk/content-addressable-storage";

export async function saveWithEmptyNonce(
    client: DdcClient,
    bucketId: bigint,
    session: Session,
    piece: Piece,
    options: StoreOptions,
): Promise<DdcUri> {
    // @ts-ignore
    const dek = DdcClient.buildHierarchicalDekHex(client.masterDek, options.dekPath);
    const nonce = new Uint8Array(nacl.box.nonceLength);
    const edek = nacl.box(dek, nonce, client.boxKeypair.publicKey, client.boxKeypair.secretKey);

    await client.caStorage.store(
        bucketId,
        session,
        new Piece(edek, [
            new Tag('encryptor', u8aToHex(client.boxKeypair.publicKey)),
            new Tag('Key', `${bucketId}/${options.dekPath || ''}/${u8aToHex(client.boxKeypair.publicKey)}`),
        ]),
    );

    const encryptionOptions = {dekPath: options.dekPath || '', dek: dek};
    const pieceUri = await client.caStorage.storeEncrypted(bucketId, session, piece, encryptionOptions);
    return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
}
