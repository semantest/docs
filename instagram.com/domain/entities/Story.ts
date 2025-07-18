import { AggregateRoot } from '../../../../core/src/entities';
import { StoryId } from '../value-objects/StoryId';
import { UserId } from '../value-objects/UserId';
import { StoryArchived } from '../events/StoryArchived';
import { StoryDownloaded } from '../events/StoryDownloaded';
import { StoryViewed } from '../events/StoryViewed';

export interface StoryProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number; // in seconds, for video stories
  timestamp: Date;
  expiresAt: Date;
  isHighlighted: boolean;
}

export class Story extends AggregateRoot {
  private constructor(
    private readonly id: StoryId,
    private readonly authorId: UserId,
    private props: StoryProps,
    private localPath?: string,
    private downloadedAt?: Date,
    private archivedAt?: Date,
    private viewedAt?: Date
  ) {
    super();
  }

  static create(
    id: StoryId,
    authorId: UserId,
    props: StoryProps
  ): Story {
    const story = new Story(id, authorId, props);
    return story;
  }

  markAsViewed(): void {
    if (this.isExpired()) {
      throw new Error('Cannot view expired story');
    }
    this.viewedAt = new Date();
    this.addDomainEvent(
      new StoryViewed(this.id, this.authorId, this.viewedAt)
    );
  }

  archive(): void {
    this.archivedAt = new Date();
    this.addDomainEvent(
      new StoryArchived(this.id, this.authorId, this.archivedAt)
    );
  }

  markAsDownloaded(localPath: string): void {
    this.localPath = localPath;
    this.downloadedAt = new Date();
    this.addDomainEvent(
      new StoryDownloaded(
        this.id,
        this.authorId,
        localPath,
        this.downloadedAt
      )
    );
  }

  highlight(): void {
    this.props.isHighlighted = true;
  }

  removeHighlight(): void {
    this.props.isHighlighted = false;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isDownloaded(): boolean {
    return !!this.downloadedAt;
  }

  isArchived(): boolean {
    return !!this.archivedAt;
  }

  getId(): StoryId {
    return this.id;
  }

  getAuthorId(): UserId {
    return this.authorId;
  }

  getMediaUrl(): string {
    return this.props.mediaUrl;
  }

  getMediaType(): 'image' | 'video' {
    return this.props.mediaType;
  }

  getDuration(): number | undefined {
    return this.props.duration;
  }

  getTimestamp(): Date {
    return this.props.timestamp;
  }

  getExpiresAt(): Date {
    return this.props.expiresAt;
  }

  isHighlighted(): boolean {
    return this.props.isHighlighted;
  }

  getLocalPath(): string | undefined {
    return this.localPath;
  }

  getDownloadedAt(): Date | undefined {
    return this.downloadedAt;
  }

  getArchivedAt(): Date | undefined {
    return this.archivedAt;
  }

  getViewedAt(): Date | undefined {
    return this.viewedAt;
  }

  protected apply(event: any): void {
    // Event sourcing implementation would go here
  }
}