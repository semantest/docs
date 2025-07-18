import { ValueObject } from '../../../shared/domain/ValueObject';

export class PlaylistId extends ValueObject {
  constructor(private readonly value: string) {
    super();
    if (!this.isValid(value)) {
      throw new Error('Invalid YouTube playlist ID');
    }
  }

  private isValid(value: string): boolean {
    // YouTube playlist IDs start with 'PL' and are 34 characters long
    return /^PL[a-zA-Z0-9_-]{32}$/.test(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PlaylistId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}