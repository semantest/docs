import { DomainEvent } from '../../../../core/src/events';
import { ThreadId } from '../value-objects/ThreadId';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';

export class TweetAddedToThread extends DomainEvent {
  public readonly eventType = 'twitter.tweet.added.to.thread';

  constructor(
    public readonly threadId: ThreadId,
    public readonly tweetId: TweetId,
    public readonly authorId: UserId,
    public readonly addedAt: Date
  ) {
    super(threadId.toString(), threadId.toString());
  }
}