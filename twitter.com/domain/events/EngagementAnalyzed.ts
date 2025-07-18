import { DomainEvent } from '../../../../core/src/events';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';
import { EngagementMetrics } from '../entities/Engagement';

export class EngagementAnalyzed extends DomainEvent {
  public readonly eventType = 'twitter.engagement.analyzed';

  constructor(
    public readonly tweetId: TweetId,
    public readonly authorId: UserId,
    public readonly metrics: EngagementMetrics,
    public readonly insights: string[],
    public readonly analyzedAt: Date
  ) {
    super(tweetId.toString(), tweetId.toString());
  }
}