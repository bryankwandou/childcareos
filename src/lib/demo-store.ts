import { draftIncident, evaluateCheckIn, evaluatePickup } from "./safety.ts";

type Room = {
  id: string;
  name: string;
  activeChildren: number;
  activeStaff: number;
  ratioLimit: number;
  roomCapacity: number;
};

type PickupAttempt = {
  id: string;
  childId: string;
  guardianId: string;
  allowed: boolean;
  completed: boolean;
};

type Incident = ReturnType<typeof draftIncident> & {
  id: string;
  childId: string;
  finalized: boolean;
  guardianNotified: boolean;
};

const guardians = {
  elena: { id: "elena", name: "Elena Torres", linked: true, authorized: true, revoked: false, identityMatched: true },
  noah: { id: "noah", name: "Noah Lee", linked: true, authorized: false, revoked: true, identityMatched: true },
};

export class DemoStore {
  private rooms = new Map<string, Room>([
    ["sunflower", { id: "sunflower", name: "Sunflower room", activeChildren: 7, activeStaff: 2, ratioLimit: 4, roomCapacity: 12 }],
    ["meadow", { id: "meadow", name: "Meadow room", activeChildren: 6, activeStaff: 2, ratioLimit: 5, roomCapacity: 14 }],
  ]);

  private pickupAttempts = new Map<string, PickupAttempt>();
  private incidents = new Map<string, Incident>();

  getSnapshot() {
    return { rooms: Array.from(this.rooms.values()) };
  }

  attemptCheckIn(roomId: string) {
    const room = this.requireRoom(roomId);
    const decision = evaluateCheckIn(room);
    if (decision.allowed) room.activeChildren += 1;
    return { decision, room: { ...room } };
  }

  updateStaff(roomId: string, activeStaff: number) {
    const room = this.requireRoom(roomId);
    room.activeStaff = Math.max(0, activeStaff);
    const nextCheckIn = evaluateCheckIn(room);
    const currentlyOverRatio = room.activeStaff === 0 || room.activeChildren > room.activeStaff * room.ratioLimit;
    return {
      room: { ...room },
      urgentAlert: currentlyOverRatio,
      message: currentlyOverRatio
        ? "Urgent: the current room occupancy is now outside the configured ratio boundary. Reassign staff or move children immediately."
        : nextCheckIn.message,
    };
  }

  verifyPickup(childId: string, guardianId: keyof typeof guardians) {
    const guardian = guardians[guardianId];
    if (!guardian) throw new Error("Guardian record not found.");
    const decision = evaluatePickup({
      guardianLinked: guardian.linked,
      isAuthorizedPickup: guardian.authorized,
      authorizationRevoked: guardian.revoked,
      identityMatched: guardian.identityMatched,
    });
    const attempt: PickupAttempt = { id: crypto.randomUUID(), childId, guardianId, allowed: decision.allowed, completed: false };
    this.pickupAttempts.set(attempt.id, attempt);
    return { attemptId: attempt.id, decision, guardianName: guardian.name };
  }

  completePickup(attemptId: string) {
    const attempt = this.pickupAttempts.get(attemptId);
    if (!attempt || !attempt.allowed || attempt.completed) {
      return { completed: false, message: "Checkout blocked: a new successful pickup verification is required." };
    }
    attempt.completed = true;
    return { completed: true, message: "Checkout completed and recorded." };
  }

  createIncident(childId: string, rawObservation: string) {
    const draft = draftIncident(rawObservation);
    const incident: Incident = { id: crypto.randomUUID(), childId, ...draft, finalized: false, guardianNotified: false };
    this.incidents.set(incident.id, incident);
    return { ...incident };
  }

  finalizeIncident(incidentId: string) {
    const incident = this.requireIncident(incidentId);
    incident.finalized = true;
    return { ...incident };
  }

  notifyGuardian(incidentId: string) {
    const incident = this.requireIncident(incidentId);
    if (!incident.finalized) throw new Error("Finalize the reviewed incident before notifying a guardian.");
    incident.guardianNotified = true;
    return { ...incident };
  }

  getGuardianPortal(guardianId: string) {
    if (guardianId !== "elena") return { children: [], incidents: [] };
    return {
      children: [{ id: "maya", name: "Maya Chen", room: "Sunflower room", checkedInAt: "8:54 AM" }],
      incidents: Array.from(this.incidents.values()).filter((incident) => incident.childId === "maya" && incident.finalized),
    };
  }

  private requireRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found.");
    return room;
  }

  private requireIncident(incidentId: string) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error("Incident not found.");
    return incident;
  }
}

const globalStore = globalThis as typeof globalThis & { childcareDemoStore?: DemoStore };
export const demoStore = globalStore.childcareDemoStore ?? new DemoStore();
globalStore.childcareDemoStore = demoStore;
