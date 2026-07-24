import assert from "node:assert/strict";
import test from "node:test";
import { isChildcareOsMemo, VERIFIED_DEVNET_SIGNATURE } from "./solana-proof.ts";

test("recognizes ChildcareOS audit memos", () => {
  assert.equal(isChildcareOsMemo("ChildcareOS MVP audit proof | production verification | 2026-07-24"), true);
  assert.equal(isChildcareOsMemo("unrelated memo"), false);
});

test("bundled devnet proof uses a transaction-sized signature", () => {
  assert.match(VERIFIED_DEVNET_SIGNATURE, /^[1-9A-HJ-NP-Za-km-z]{80,90}$/);
});
