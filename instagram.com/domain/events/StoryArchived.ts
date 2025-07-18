import { DomainEvent } from '../../../../core/src/events';
import { StoryId } from '../value-objects/StoryId';
import { UserId } from '../value-objects/UserId';

export class StoryArchived extends DomainEvent {
  public readonly eventType = 'instagram.story.archived';

  constructor(
    public readonly storyId: StoryId,
    public readonly authorId: UserId,
    public readonly archivedAt: Date
  ) {
    super(storyId.toString(), storyId.toString());
  }
}