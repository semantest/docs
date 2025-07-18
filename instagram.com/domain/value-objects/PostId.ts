import { ValueObject } from '../../../../core/src/value-objects';

export class PostId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('PostId must be a non-empty string');
    }
    if (this.value.length < 1) {
      throw new Error('PostId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}