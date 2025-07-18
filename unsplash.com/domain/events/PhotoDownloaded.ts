import { DomainEvent } from '../../../../core/src/events';
import { PhotoId } from '../value-objects/PhotoId';
import { ArtistId } from '../value-objects/ArtistId';

export class PhotoDownloaded extends DomainEvent {
  public readonly eventType = 'unsplash.photo.downloaded';

  constructor(
    public readonly photoId: PhotoId,
    public readonly artistId: ArtistId,
    public readonly localPath: string,
    public readonly downloadedAt: Date
  ) {
    super(photoId.toString(), photoId.toString());
  }
}