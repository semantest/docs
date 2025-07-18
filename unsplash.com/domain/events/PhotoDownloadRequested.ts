import { DomainEvent } from '../../../../core/src/events';
import { PhotoId } from '../value-objects/PhotoId';
import { ArtistId } from '../value-objects/ArtistId';

export class PhotoDownloadRequested extends DomainEvent {
  public readonly eventType = 'unsplash.photo.download.requested';

  constructor(
    public readonly photoId: PhotoId,
    public readonly artistId: ArtistId,
    public readonly downloadUrl: string,
    public readonly requestedAt: Date
  ) {
    super(photoId.toString(), photoId.toString());
  }
}