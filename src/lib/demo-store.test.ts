import assert from "node:assert/strict";
import test from "node:test";
import { DemoStore } from "./demo-store.ts";

test("server store rejects a direct check-in after reaching the ratio boundary", () => {
  const store = new DemoStore();
  assert.equal(store.attemptCheckIn("sunflower").decision.allowed, true);
  assert.equal(store.attemptCheckIn("sunflower").decision.code, "ratio_limit");
});

test("removing staff from an occupied room emits an urgent alert", () => {
  const store = new DemoStore();
  const result = store.updateStaff("sunflower", 1);
  assert.equal(result.urgentAlert, true);
});

test("a blocked pickup attempt cannot complete checkout", () => {
  const store = new DemoStore();
  const verification = store.verifyPickup("maya", "noah");
  assert.equal(verification.decision.code, "revoked");
  assert.equal(store.completePickup(verification.attemptId).completed, false);
});

test("a successful pickup attempt completes only once", () => {
  const store = new DemoStore();
  const verification = store.verifyPickup("maya", "elena");
  assert.equal(store.completePickup(verification.attemptId).completed, true);
  assert.equal(store.completePickup(verification.attemptId).completed, false);
});

test("incident drafting never notifies a guardian as a side effect", () => {
  const store = new DemoStore();
  const incident = store.createIncident("maya", "Maya slipped beside the water table and had a red mark on her left knee.");
  assert.equal(incident.finalized, false);
  assert.equal(incident.guardianNotified, false);
  assert.throws(() => store.notifyGuardian(incident.id));
});

test("guardian data is scoped to the linked family", () => {
  const store = new DemoStore();
  assert.equal(store.getGuardianPortal("elena").children.length, 1);
  assert.equal(store.getGuardianPortal("another-guardian").children.length, 0);
});
