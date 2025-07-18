import { DomainEvent } from '../../../../core/src/events';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';
import { TweetProps } from '../entities/Tweet';

export class TweetSaved extends DomainEvent {
  public readonly eventType = 'twitter.tweet.saved';

  constructor(
    public readonly tweetId: TweetId,
    public readonly authorId: UserId,
    public readonly props: TweetProps,
    public readonly savedAt: Date
  ) {
    super(tweetId.toString(), tweetId.toString());
  }
}