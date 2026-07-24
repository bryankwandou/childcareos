import nacl from "tweetnacl";

export function verifyWalletOwnershipSignature(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
  return nacl.sign.detached.verify(message, signature, publicKey);
}
