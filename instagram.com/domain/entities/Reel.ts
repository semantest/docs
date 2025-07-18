import { AggregateRoot } from '../../../../core/src/entities';
import { ReelId } from '../value-objects/ReelId';
import { UserId } from '../value-objects/UserId';
import { ReelSaved } from '../events/ReelSaved';
import { ReelDownloaded } from '../events/ReelDownloaded';
import { ReelShared } from '../events/ReelShared';

export interface ReelProps {
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  duration: number; // in seconds
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags: string[];
  audioTrack?: string;
  timestamp: Date;
}

export class Reel extends AggregateRoot {
  private constructor(
    private readonly id: ReelId,
    private readonly authorId: UserId,
    private props: ReelProps,
    private localPath?: string,
    private downloadedAt?: Date,
    private savedAt?: Date
  ) {
    super();
  }

  static create(
    id: ReelId,
    authorId: UserId,
    props: ReelProps
  ): Reel {
    const reel = new Reel(id, authorId, props);
    reel.savedAt = new Date();
    reel.addDomainEvent(
      new ReelSaved(id, authorId, props, reel.savedAt)
    );
    return reel;
  }

  markAsDownloaded(localPath: string): void {
    this.localPath = localPath;
    this.downloadedAt = new Date();
    this.addDomainEvent(
      new ReelDownloaded(
        this.id,
        this.authorId,
        localPath,
        this.downloadedAt
      )
    );
  }

  share(): void {
    this.props.sharesCount += 1;
    this.addDomainEvent(
      new ReelShared(this.id, this.authorId, new Date())
    );
  }

  updateEngagement(views: number, likes: number, comments: number): void {
    this.props.viewsCount = views;
    this.props.likesCount = likes;
    this.props.commentsCount = comments;
  }

  addHashtag(hashtag: string): void {
    if (!this.props.hashtags.includes(hashtag)) {
      this.props.hashtags.push(hashtag);
    }
  }

  removeHashtag(hashtag: string): void {
    this.props.hashtags = this.props.hashtags.filter(h => h !== hashtag);
  }

  isDownloaded(): boolean {
    return !!this.downloadedAt;
  }

  getId(): ReelId {
    return this.id;
  }

  getAuthorId(): UserId {
    return this.authorId;
  }

  getVideoUrl(): string {
    return this.props.videoUrl;
  }

  getThumbnailUrl(): string {
    return this.props.thumbnailUrl;
  }

  getCaption(): string {
    return this.props.caption;
  }

  getDuration(): number {
    return this.props.duration;
  }

  getViewsCount(): number {
    return this.props.viewsCount;
  }

  getLikesCount(): number {
    return this.props.likesCount;
  }

  getCommentsCount(): number {
    return this.props.commentsCount;
  }

  getSharesCount(): number {
    return this.props.sharesCount;
  }

  getHashtags(): string[] {
    return [...this.props.hashtags];
  }

  getAudioTrack(): string | undefined {
    return this.props.audioTrack;
  }

  getTimestamp(): Date {
    return this.props.timestamp;
  }

  getLocalPath(): string | undefined {
    return this.localPath;
  }

  getSavedAt(): Date | undefined {
    return this.savedAt;
  }

  getDownloadedAt(): Date | undefined {
    return this.downloadedAt;
  }

  protected apply(event: any): void {
    // Event sourcing implementation would go here
  }
}