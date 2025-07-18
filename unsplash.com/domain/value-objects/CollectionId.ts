import { ValueObject } from '../../../../core/src/value-objects';

export class CollectionId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('CollectionId must be a non-empty string');
    }
  }

  toString(): string {
    return this.value;
  }
}