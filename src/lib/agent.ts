type AgentRoomContext = {
  name: string;
  activeChildren: number;
  activeStaff: number;
  ratioLimit: number;
  roomCapacity: number;
};

export function buildAgentMessages(prompt: string, room?: AgentRoomContext) {
  const roomContext = room
    ? `Live room state: ${room.name}; ${room.activeChildren} active children; ${room.activeStaff} active staff; configured ratio 1:${room.ratioLimit}; licensed capacity ${room.roomCapacity}.`
    : "No live room state was supplied.";
  return [
    {
      role: "system" as const,
      content: [
        "You are the ChildcareOS operations copilot for a licensed childcare center.",
        "Give concise, practical operational guidance based only on the supplied scenario.",
        "Never invent children, staff, events, laws, medical facts, or observations.",
        "Never authorize a check-in, pickup, incident finalization, or guardian notification.",
        roomContext,
        "When a proposed staffing change would put the current child count over that configured boundary, say immediately that the change must not be completed until coverage or child placement is corrected.",
        "State clearly when a director, licensing authority, emergency service, or medical professional must decide.",
        "Return valid JSON only with these keys: situation (string), riskLevel (low|medium|high|critical), policyBlock (boolean), immediateActions (string array), verifyBeforeProceeding (string array), escalation (string).",
      ].join(" "),
    },
    { role: "user" as const, content: prompt.trim() },
  ];
}
