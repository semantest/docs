import { ValueObject } from '../../../shared/domain/ValueObject';

export class ChannelId extends ValueObject {
  constructor(private readonly value: string) {
    super();
    if (!this.isValid(value)) {
      throw new Error('Invalid YouTube channel ID');
    }
  }

  private isValid(value: string): boolean {
    // YouTube channel IDs start with 'UC' and are 24 characters long
    return /^UC[a-zA-Z0-9_-]{22}$/.test(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ChannelId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}