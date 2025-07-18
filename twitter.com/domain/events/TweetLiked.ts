import { DomainEvent } from '../../../../core/src/events';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';

export class TweetLiked extends DomainEvent {
  public readonly eventType = 'twitter.tweet.liked';

  constructor(
    public readonly tweetId: TweetId,
    public readonly authorId: UserId,
    public readonly likedAt: Date
  ) {
    super(tweetId.toString(), tweetId.toString());
  }
}