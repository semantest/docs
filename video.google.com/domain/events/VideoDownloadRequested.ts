import { DomainEvent } from '../../../shared/domain/DomainEvent';
import { VideoId } from '../value-objects/VideoId';
import { VideoMetadata } from '../value-objects/VideoMetadata';
import { VideoQuality } from '../value-objects/VideoQuality';

export class VideoDownloadRequested extends DomainEvent {
  constructor(
    public readonly videoId: VideoId,
    public readonly metadata: VideoMetadata,
    public readonly quality: VideoQuality,
    occurredOn: Date
  ) {
    super('video.download.requested', occurredOn);
  }
}