import { ValueObject } from '../../../shared/domain/ValueObject';

export class VideoId extends ValueObject {
  constructor(private readonly value: string) {
    super();
    if (!this.isValid(value)) {
      throw new Error('Invalid YouTube video ID');
    }
  }

  private isValid(value: string): boolean {
    // YouTube video IDs are typically 11 characters
    return /^[a-zA-Z0-9_-]{11}$/.test(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: VideoId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}