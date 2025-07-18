import { DomainEvent } from '../../../shared/domain/DomainEvent';
import { VideoId } from '../value-objects/VideoId';

export class VideoDownloadCompleted extends DomainEvent {
  constructor(
    public readonly videoId: VideoId,
    public readonly downloadUrl: string,
    occurredOn: Date
  ) {
    super('video.download.completed', occurredOn);
  }
}