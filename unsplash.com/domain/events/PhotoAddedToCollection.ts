import { DomainEvent } from '../../../../core/src/events';
import { CollectionId } from '../value-objects/CollectionId';
import { PhotoId } from '../value-objects/PhotoId';
import { ArtistId } from '../value-objects/ArtistId';

export class PhotoAddedToCollection extends DomainEvent {
  public readonly eventType = 'unsplash.photo.added.to.collection';

  constructor(
    public readonly collectionId: CollectionId,
    public readonly photoId: PhotoId,
    public readonly curatorId: ArtistId,
    public readonly addedAt: Date
  ) {
    super(collectionId.toString(), collectionId.toString());
  }
}