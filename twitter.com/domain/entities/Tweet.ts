import { AggregateRoot } from '../../../../core/src/entities';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';
import { ThreadId } from '../value-objects/ThreadId';
import { TweetSaved } from '../events/TweetSaved';
import { TweetLiked } from '../events/TweetLiked';
import { TweetRetweeted } from '../events/TweetRetweeted';

export interface TweetProps {
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  retweetCount: number;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  viewCount: number;
  createdAt: Date;
  isRetweet: boolean;
  originalTweetId?: TweetId;
  inReplyToTweetId?: TweetId;
  isQuoteTweet: boolean;
  quotedTweetId?: TweetId;
  language?: string;
  source?: string;
}

export class Tweet extends AggregateRoot {
  private constructor(
    private readonly id: TweetId,
    private readonly authorId: UserId,
    private props: TweetProps,
    private threadId?: ThreadId,
    private savedAt?: Date,
    private likedAt?: Date,
    private retweetedAt?: Date
  ) {
    super();
  }

  static create(
    id: TweetId,
    authorId: UserId,
    props: TweetProps,
    threadId?: ThreadId
  ): Tweet {
    const tweet = new Tweet(id, authorId, props, threadId);
    tweet.savedAt = new Date();
    tweet.addDomainEvent(
      new TweetSaved(id, authorId, props, tweet.savedAt)
    );
    return tweet;
  }

  like(): void {
    if (this.isLiked()) {
      throw new Error('Tweet is already liked');
    }
    this.likedAt = new Date();
    this.props.likeCount += 1;
    this.addDomainEvent(
      new TweetLiked(this.id, this.authorId, this.likedAt)
    );
  }

  retweet(): void {
    if (this.isRetweeted()) {
      throw new Error('Tweet is already retweeted');
    }
    this.retweetedAt = new Date();
    this.props.retweetCount += 1;
    this.addDomainEvent(
      new TweetRetweeted(this.id, this.authorId, this.retweetedAt)
    );
  }

  updateEngagement(retweets: number, likes: number, replies: number, quotes: number, views: number): void {
    this.props.retweetCount = retweets;
    this.props.likeCount = likes;
    this.props.replyCount = replies;
    this.props.quoteCount = quotes;
    this.props.viewCount = views;
  }

  addHashtag(hashtag: string): void {
    if (!this.props.hashtags.includes(hashtag)) {
      this.props.hashtags.push(hashtag);
    }
  }

  addMention(mention: string): void {
    if (!this.props.mentions.includes(mention)) {
      this.props.mentions.push(mention);
    }
  }

  addToThread(threadId: ThreadId): void {
    this.threadId = threadId;
  }

  removeFromThread(): void {
    this.threadId = undefined;
  }

  isLiked(): boolean {
    return !!this.likedAt;
  }

  isRetweeted(): boolean {
    return !!this.retweetedAt;
  }

  isReply(): boolean {
    return !!this.props.inReplyToTweetId;
  }

  isQuoteTweet(): boolean {
    return this.props.isQuoteTweet;
  }

  hasMedia(): boolean {
    return this.props.mediaUrls.length > 0;
  }

  getId(): TweetId {
    return this.id;
  }

  getAuthorId(): UserId {
    return this.authorId;
  }

  getContent(): string {
    return this.props.content;
  }

  getMediaUrls(): string[] {
    return [...this.props.mediaUrls];
  }

  getHashtags(): string[] {
    return [...this.props.hashtags];
  }

  getMentions(): string[] {
    return [...this.props.mentions];
  }

  getEngagement(): {
    retweets: number;
    likes: number;
    replies: number;
    quotes: number;
    views: number;
  } {
    return {
      retweets: this.props.retweetCount,
      likes: this.props.likeCount,
      replies: this.props.replyCount,
      quotes: this.props.quoteCount,
      views: this.props.viewCount
    };
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getThreadId(): ThreadId | undefined {
    return this.threadId;
  }

  getOriginalTweetId(): TweetId | undefined {
    return this.props.originalTweetId;
  }

  getInReplyToTweetId(): TweetId | undefined {
    return this.props.inReplyToTweetId;
  }

  getQuotedTweetId(): TweetId | undefined {
    return this.props.quotedTweetId;
  }

  getLanguage(): string | undefined {
    return this.props.language;
  }

  getSource(): string | undefined {
    return this.props.source;
  }

  getSavedAt(): Date | undefined {
    return this.savedAt;
  }

  getLikedAt(): Date | undefined {
    return this.likedAt;
  }

  getRetweetedAt(): Date | undefined {
    return this.retweetedAt;
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}