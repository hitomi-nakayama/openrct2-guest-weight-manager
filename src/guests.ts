import { BoundedInt } from "./numbers";

export const GUEST_MIN_WEIGHT = 45;
export const GUEST_MAX_WEIGHT = 76;

export class GuestMass extends BoundedInt {
  constructor(value: number) {
    super(value, GUEST_MIN_WEIGHT, GUEST_MAX_WEIGHT);
  }
}

export function setAllGuestsMass(mass: number) {
  let numChanged = 0;
  for (const guest of map.getAllEntities("guest")) {
    if (guest.mass !== mass) {
      numChanged++;
    }
    guest.mass = mass;
  }
  console.log(`Number of guests changed: ${numChanged}`);
}
