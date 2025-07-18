import { ValueObject } from '../../../../core/src/value-objects';

export interface PostMetadataProps {
  caption: string;
  imageUrl: string;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  hashtags: string[];
  location?: string;
  timestamp: Date;
  isVideo: boolean;
  videoUrl?: string;
}

export class PostMetadata extends ValueObject<PostMetadataProps> {
  constructor(props: PostMetadataProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.value.caption || typeof this.value.caption !== 'string') {
      throw new Error('Caption must be a non-empty string');
    }
    if (!this.value.imageUrl || typeof this.value.imageUrl !== 'string') {
      throw new Error('Image URL must be a non-empty string');
    }
    if (this.value.likesCount < 0) {
      throw new Error('Likes count cannot be negative');
    }
    if (this.value.commentsCount < 0) {
      throw new Error('Comments count cannot be negative');
    }
    if (!Array.isArray(this.value.hashtags)) {
      throw new Error('Hashtags must be an array');
    }
    if (this.value.isVideo && !this.value.videoUrl) {
      throw new Error('Video URL is required for video posts');
    }
  }

  getCaption(): string {
    return this.value.caption;
  }

  getImageUrl(): string {
    return this.value.imageUrl;
  }

  getThumbnailUrl(): string | undefined {
    return this.value.thumbnailUrl;
  }

  getLikesCount(): number {
    return this.value.likesCount;
  }

  getCommentsCount(): number {
    return this.value.commentsCount;
  }

  getHashtags(): string[] {
    return [...this.value.hashtags];
  }

  getLocation(): string | undefined {
    return this.value.location;
  }

  getTimestamp(): Date {
    return this.value.timestamp;
  }

  isVideoPost(): boolean {
    return this.value.isVideo;
  }

  getVideoUrl(): string | undefined {
    return this.value.videoUrl;
  }
}