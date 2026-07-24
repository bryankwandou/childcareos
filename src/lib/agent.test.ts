import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentMessages } from "./agent.ts";

test("agent prompt preserves the scenario and forbids authorization", () => {
  const messages = buildAgentMessages("The Sunflower room has seven children and one staff member.", { name: "Sunflower room", activeChildren: 7, activeStaff: 1, ratioLimit: 4, roomCapacity: 12 });
  assert.match(messages[0].content, /Never authorize/);
  assert.match(messages[0].content, /7 active children/);
  assert.match(messages[0].content, /valid JSON only/);
  assert.equal(messages[1].content, "The Sunflower room has seven children and one staff member.");
});
