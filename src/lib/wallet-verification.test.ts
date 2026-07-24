import assert from "node:assert/strict";
import test from "node:test";
import nacl from "tweetnacl";
import { verifyWalletOwnershipSignature } from "./wallet-verification.ts";

test("accepts a valid Ed25519 wallet ownership challenge", () => {
  const wallet = nacl.sign.keyPair();
  const message = new TextEncoder().encode("ChildcareOS wallet ownership verification");
  const signature = nacl.sign.detached(message, wallet.secretKey);
  assert.equal(verifyWalletOwnershipSignature(message, signature, wallet.publicKey), true);
});

test("rejects a challenge signed by a different wallet", () => {
  const expectedWallet = nacl.sign.keyPair();
  const otherWallet = nacl.sign.keyPair();
  const message = new TextEncoder().encode("ChildcareOS wallet ownership verification");
  const signature = nacl.sign.detached(message, otherWallet.secretKey);
  assert.equal(verifyWalletOwnershipSignature(message, signature, expectedWallet.publicKey), false);
});
