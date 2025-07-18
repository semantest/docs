import { ValueObject } from '../../../shared/domain/ValueObject';

export class PinId extends ValueObject {
  constructor(private readonly value: string) {
    super();
    if (!this.isValid(value)) {
      throw new Error('Invalid Pinterest pin ID');
    }
  }

  private isValid(value: string): boolean {
    // Pinterest pin IDs are typically numeric strings
    return /^\d+$/.test(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PinId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}