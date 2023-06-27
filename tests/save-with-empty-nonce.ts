import {DdcClient, DdcUri, IPIECE, Piece, StoreOptions, Tag} from '@cere-ddc-sdk/ddc-client';
import nacl from 'tweetnacl';
import {u8aToHex} from '@polkadot/util';

export async function saveWithEmptyNonce(
    client: DdcClient,
    bucketId: bigint,
    piece: Piece,
    options: StoreOptions,
): Promise<DdcUri> {
    // @ts-ignore
    const dek = DdcClient.buildHierarchicalDekHex(client.masterDek, options.dekPath);
    const nonce = new Uint8Array(nacl.box.nonceLength);
    const edek = nacl.box(dek, nonce, client.boxKeypair.publicKey, client.boxKeypair.secretKey);
    const edekPiece = new Piece(edek, [
        new Tag('encryptor', u8aToHex(client.boxKeypair.publicKey)),
        new Tag('Key', `${bucketId}/${options.dekPath || ''}/${u8aToHex(client.boxKeypair.publicKey)}`),
    ]);

    await client.caStorage.store(bucketId, edekPiece, options);

    const encryptionOptions = {dekPath: options.dekPath || '', dek: dek};
    const pieceUri = await client.caStorage.storeEncrypted(bucketId, piece, encryptionOptions, options);

    return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
}
