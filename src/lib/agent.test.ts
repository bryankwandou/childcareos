import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentMessages } from "./agent.ts";

test("agent prompt preserves the scenario and forbids authorization", () => {
  const messages = buildAgentMessages("The Sunflower room has seven children and one staff member.");
  assert.match(messages[0].content, /Never authorize/);
  assert.equal(messages[1].content, "The Sunflower room has seven children and one staff member.");
});
