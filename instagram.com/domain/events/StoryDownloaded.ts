import { DomainEvent } from '../../../../core/src/events';
import { StoryId } from '../value-objects/StoryId';
import { UserId } from '../value-objects/UserId';

export class StoryDownloaded extends DomainEvent {
  public readonly eventType = 'instagram.story.downloaded';

  constructor(
    public readonly storyId: StoryId,
    public readonly authorId: UserId,
    public readonly localPath: string,
    public readonly downloadedAt: Date
  ) {
    super(storyId.toString(), storyId.toString());
  }
}