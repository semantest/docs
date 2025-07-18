import { AggregateRoot } from '../../../../core/src/entities';
import { ThreadId } from '../value-objects/ThreadId';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';
import { ThreadCreated } from '../events/ThreadCreated';
import { ThreadArchived } from '../events/ThreadArchived';
import { TweetAddedToThread } from '../events/TweetAddedToThread';

export interface ThreadProps {
  title?: string;
  description?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Thread extends AggregateRoot {
  private constructor(
    private readonly id: ThreadId,
    private readonly authorId: UserId,
    private props: ThreadProps,
    private tweets: TweetId[] = [],
    private archivedAt?: Date
  ) {
    super();
  }

  static create(
    id: ThreadId,
    authorId: UserId,
    props: ThreadProps
  ): Thread {
    const thread = new Thread(id, authorId, props);
    thread.addDomainEvent(
      new ThreadCreated(id, authorId, props, new Date())
    );
    return thread;
  }

  addTweet(tweetId: TweetId): void {
    if (this.tweets.includes(tweetId)) {
      throw new Error('Tweet is already in thread');
    }
    if (this.isArchived()) {
      throw new Error('Cannot add tweet to archived thread');
    }
    this.tweets.push(tweetId);
    this.props.updatedAt = new Date();
    this.addDomainEvent(
      new TweetAddedToThread(this.id, tweetId, this.authorId, new Date())
    );
  }

  removeTweet(tweetId: TweetId): void {
    const index = this.tweets.indexOf(tweetId);
    if (index === -1) {
      throw new Error('Tweet is not in thread');
    }
    this.tweets.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  archive(): void {
    if (this.isArchived()) {
      throw new Error('Thread is already archived');
    }
    this.archivedAt = new Date();
    this.addDomainEvent(
      new ThreadArchived(this.id, this.authorId, this.archivedAt)
    );
  }

  unarchive(): void {
    this.archivedAt = undefined;
  }

  makePrivate(): void {
    this.props.isPrivate = true;
    this.props.updatedAt = new Date();
  }

  makePublic(): void {
    this.props.isPrivate = false;
    this.props.updatedAt = new Date();
  }

  updateMetadata(updates: Partial<Pick<ThreadProps, 'title' | 'description'>>): void {
    this.props = { ...this.props, ...updates, updatedAt: new Date() };
  }

  reorderTweets(newOrder: TweetId[]): void {
    // Validate that all tweets in newOrder exist in current tweets
    const currentTweetIds = new Set(this.tweets.map(t => t.toString()));
    const newTweetIds = new Set(newOrder.map(t => t.toString()));
    
    if (currentTweetIds.size !== newTweetIds.size || 
        ![...currentTweetIds].every(id => newTweetIds.has(id))) {
      throw new Error('New order must contain exactly the same tweets');
    }
    
    this.tweets = newOrder;
    this.props.updatedAt = new Date();
  }

  isArchived(): boolean {
    return !!this.archivedAt;
  }

  isEmpty(): boolean {
    return this.tweets.length === 0;
  }

  getId(): ThreadId {
    return this.id;
  }

  getAuthorId(): UserId {
    return this.authorId;
  }

  getTitle(): string | undefined {
    return this.props.title;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  isPrivate(): boolean {
    return this.props.isPrivate;
  }

  getTweets(): TweetId[] {
    return [...this.tweets];
  }

  getTweetCount(): number {
    return this.tweets.length;
  }

  getFirstTweetId(): TweetId | undefined {
    return this.tweets[0];
  }

  getLastTweetId(): TweetId | undefined {
    return this.tweets[this.tweets.length - 1];
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getArchivedAt(): Date | undefined {
    return this.archivedAt;
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}