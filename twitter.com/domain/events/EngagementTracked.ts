import { DomainEvent } from '../../../../core/src/events';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';
import { EngagementMetrics } from '../entities/Engagement';

export class EngagementTracked extends DomainEvent {
  public readonly eventType = 'twitter.engagement.tracked';

  constructor(
    public readonly tweetId: TweetId,
    public readonly authorId: UserId,
    public readonly metrics: EngagementMetrics,
    public readonly trackedAt: Date
  ) {
    super(tweetId.toString(), tweetId.toString());
  }
}