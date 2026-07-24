export type CheckInInput = {
  activeChildren: number;
  activeStaff: number;
  ratioLimit: number;
  roomCapacity: number;
};

export type SafetyDecision = {
  allowed: boolean;
  code: "allowed" | "no_active_staff" | "ratio_limit" | "capacity_limit";
  message: string;
};

export function evaluateCheckIn(input: CheckInInput): SafetyDecision {
  if (input.activeStaff <= 0) {
    return {
      allowed: false,
      code: "no_active_staff",
      message: "Check-in blocked: no active staff member is assigned to this room.",
    };
  }

  if (input.activeChildren >= input.roomCapacity) {
    return {
      allowed: false,
      code: "capacity_limit",
      message: "Check-in blocked: the room has reached its licensed capacity.",
    };
  }

  const legalMaximum = input.activeStaff * input.ratioLimit;
  if (input.activeChildren + 1 > legalMaximum) {
    return {
      allowed: false,
      code: "ratio_limit",
      message: "Check-in blocked: another child would exceed the required staff-to-child ratio.",
    };
  }

  return {
    allowed: true,
    code: "allowed",
    message: "Check-in allowed. The room remains within ratio and capacity limits.",
  };
}

export type PickupInput = {
  guardianLinked: boolean;
  isAuthorizedPickup: boolean;
  authorizationRevoked: boolean;
  identityMatched: boolean;
};

export type PickupDecision = {
  allowed: boolean;
  code: "allowed" | "not_linked" | "revoked" | "not_authorized" | "identity_mismatch";
  message: string;
};

export function evaluatePickup(input: PickupInput): PickupDecision {
  if (!input.guardianLinked) {
    return { allowed: false, code: "not_linked", message: "Pickup blocked: this person is not linked to the child." };
  }

  if (input.authorizationRevoked) {
    return { allowed: false, code: "revoked", message: "Pickup blocked: this authorization was revoked." };
  }

  if (!input.isAuthorizedPickup) {
    return { allowed: false, code: "not_authorized", message: "Pickup blocked: this person is not on the active pickup list." };
  }

  if (!input.identityMatched) {
    return { allowed: false, code: "identity_mismatch", message: "Pickup blocked: the presented identity could not be verified." };
  }

  return { allowed: true, code: "allowed", message: "Pickup verified. Checkout may proceed." };
}

export function draftIncident(rawObservation: string) {
  const observation = rawObservation.trim().replace(/\s+/g, " ");
  if (observation.length < 12) {
    throw new Error("Add a specific observation before creating a draft.");
  }

  return {
    status: "draft_review_required" as const,
    summary: observation,
    staffReviewRequired: true,
    guardianNotified: false,
    notice: "Review every sentence before finalizing. Guardian notification is a separate action.",
  };
}
