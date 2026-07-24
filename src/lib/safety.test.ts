import assert from "node:assert/strict";
import test from "node:test";
import { draftIncident, evaluateCheckIn, evaluatePickup } from "./safety.ts";

test("allows a child one place below the ratio boundary", () => {
  assert.equal(evaluateCheckIn({ activeChildren: 7, activeStaff: 2, ratioLimit: 4, roomCapacity: 12 }).allowed, true);
});

test("blocks the next child at the exact ratio boundary", () => {
  assert.equal(evaluateCheckIn({ activeChildren: 8, activeStaff: 2, ratioLimit: 4, roomCapacity: 12 }).code, "ratio_limit");
});

test("blocks check-in with zero active staff", () => {
  assert.equal(evaluateCheckIn({ activeChildren: 0, activeStaff: 0, ratioLimit: 4, roomCapacity: 12 }).code, "no_active_staff");
});

test("blocks capacity independently from ratio", () => {
  assert.equal(evaluateCheckIn({ activeChildren: 10, activeStaff: 5, ratioLimit: 4, roomCapacity: 10 }).code, "capacity_limit");
});

test("blocks an explicitly revoked pickup authorization", () => {
  assert.equal(evaluatePickup({ guardianLinked: true, isAuthorizedPickup: false, authorizationRevoked: true, identityMatched: true }).code, "revoked");
});

test("incident draft preserves the observation and requires review", () => {
  const result = draftIncident("Maya slipped beside the water table and had a small red mark on her left knee.");
  assert.equal(result.guardianNotified, false);
  assert.equal(result.staffReviewRequired, true);
  assert.match(result.summary, /water table/);
});
