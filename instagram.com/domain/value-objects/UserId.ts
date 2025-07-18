import { ValueObject } from '../../../../core/src/value-objects';

export class UserId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('UserId must be a non-empty string');
    }
    if (this.value.length < 1) {
      throw new Error('UserId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}