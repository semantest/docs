import { DomainEvent } from '../../../../core/src/events';
import { StoryId } from '../value-objects/StoryId';
import { UserId } from '../value-objects/UserId';

export class StoryViewed extends DomainEvent {
  public readonly eventType = 'instagram.story.viewed';

  constructor(
    public readonly storyId: StoryId,
    public readonly authorId: UserId,
    public readonly viewedAt: Date
  ) {
    super(storyId.toString(), storyId.toString());
  }
}