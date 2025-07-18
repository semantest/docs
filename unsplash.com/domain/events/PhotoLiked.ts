import { DomainEvent } from '../../../../core/src/events';
import { PhotoId } from '../value-objects/PhotoId';
import { ArtistId } from '../value-objects/ArtistId';

export class PhotoLiked extends DomainEvent {
  public readonly eventType = 'unsplash.photo.liked';

  constructor(
    public readonly photoId: PhotoId,
    public readonly artistId: ArtistId,
    public readonly likedAt: Date
  ) {
    super(photoId.toString(), photoId.toString());
  }
}