export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

/**
 * An integer kept between two bounds
 */
export class BoundedInt {
  readonly min: number;
  readonly max: number;
  _value: number;

  get value(): number {
    return this._value;
  }

  set value(v: number) {
    // use Math.round because a variable could easily end up as 0.9999... due to
    // floating point rounding error
    this._value = clamp(Math.round(v), this.min, this.max);
  }

  constructor(value: number, min: number, max: number) {
    this.min = Math.round(min);
    this.max = Math.round(max);

    this._value = min;  // TS doesn't like when the field isn't set directly
    this.value = value;
  }
}
