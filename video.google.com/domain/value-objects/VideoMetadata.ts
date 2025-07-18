import { ValueObject } from '../../../shared/domain/ValueObject';

export interface VideoMetadataProps {
  title: string;
  description: string;
  duration: number; // in seconds
  publishedAt: Date;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  tags: string[];
}

export class VideoMetadata extends ValueObject {
  constructor(private readonly props: VideoMetadataProps) {
    super();
    this.validate();
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Video title cannot be empty');
    }
    if (this.props.duration < 0) {
      throw new Error('Video duration cannot be negative');
    }
    if (this.props.viewCount < 0 || this.props.likeCount < 0) {
      throw new Error('View and like counts cannot be negative');
    }
  }

  getTitle(): string {
    return this.props.title;
  }

  getDescription(): string {
    return this.props.description;
  }

  getDuration(): number {
    return this.props.duration;
  }

  getPublishedAt(): Date {
    return this.props.publishedAt;
  }

  getChannelId(): string {
    return this.props.channelId;
  }

  getChannelTitle(): string {
    return this.props.channelTitle;
  }

  getThumbnailUrl(): string {
    return this.props.thumbnailUrl;
  }

  getViewCount(): number {
    return this.props.viewCount;
  }

  getLikeCount(): number {
    return this.props.likeCount;
  }

  getTags(): string[] {
    return [...this.props.tags];
  }

  getFormattedDuration(): string {
    const hours = Math.floor(this.props.duration / 3600);
    const minutes = Math.floor((this.props.duration % 3600) / 60);
    const seconds = this.props.duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}