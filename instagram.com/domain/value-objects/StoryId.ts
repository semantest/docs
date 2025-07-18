import { ValueObject } from '../../../../core/src/value-objects';

export class StoryId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('StoryId must be a non-empty string');
    }
    if (this.value.length < 1) {
      throw new Error('StoryId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}