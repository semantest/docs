import { ValueObject } from '../../../../core/src/value-objects';

export class PhotoId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('PhotoId must be a non-empty string');
    }
  }

  toString(): string {
    return this.value;
  }
}