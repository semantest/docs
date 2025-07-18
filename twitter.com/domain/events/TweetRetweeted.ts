import { DomainEvent } from '../../../../core/src/events';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';

export class TweetRetweeted extends DomainEvent {
  public readonly eventType = 'twitter.tweet.retweeted';

  constructor(
    public readonly tweetId: TweetId,
    public readonly authorId: UserId,
    public readonly retweetedAt: Date
  ) {
    super(tweetId.toString(), tweetId.toString());
  }
}