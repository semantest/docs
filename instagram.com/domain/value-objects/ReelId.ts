import { ValueObject } from '../../../../core/src/value-objects';

export class ReelId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('ReelId must be a non-empty string');
    }
    if (this.value.length < 1) {
      throw new Error('ReelId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}