import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { VideoId } from '../value-objects/VideoId';
import { VideoMetadata } from '../value-objects/VideoMetadata';
import { VideoQuality } from '../value-objects/VideoQuality';
import { VideoDownloadRequested } from '../events/VideoDownloadRequested';
import { VideoDownloadCompleted } from '../events/VideoDownloadCompleted';

export class Video extends AggregateRoot {
  private constructor(
    private readonly id: VideoId,
    private metadata: VideoMetadata,
    private quality: VideoQuality,
    private downloadUrl?: string,
    private downloadedAt?: Date
  ) {
    super();
  }

  static create(
    id: VideoId,
    metadata: VideoMetadata,
    quality: VideoQuality
  ): Video {
    const video = new Video(id, metadata, quality);
    video.addDomainEvent(
      new VideoDownloadRequested(id, metadata, quality, new Date())
    );
    return video;
  }

  markAsDownloaded(downloadUrl: string): void {
    this.downloadUrl = downloadUrl;
    this.downloadedAt = new Date();
    this.addDomainEvent(
      new VideoDownloadCompleted(
        this.id,
        downloadUrl,
        this.downloadedAt
      )
    );
  }

  getId(): VideoId {
    return this.id;
  }

  getMetadata(): VideoMetadata {
    return this.metadata;
  }

  getQuality(): VideoQuality {
    return this.quality;
  }

  getDownloadUrl(): string | undefined {
    return this.downloadUrl;
  }

  isDownloaded(): boolean {
    return !!this.downloadedAt;
  }

  getDownloadedAt(): Date | undefined {
    return this.downloadedAt;
  }
}