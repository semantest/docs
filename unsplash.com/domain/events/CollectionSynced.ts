import { DomainEvent } from '../../../../core/src/events';
import { CollectionId } from '../value-objects/CollectionId';
import { ArtistId } from '../value-objects/ArtistId';

export class CollectionSynced extends DomainEvent {
  public readonly eventType = 'unsplash.collection.synced';

  constructor(
    public readonly collectionId: CollectionId,
    public readonly curatorId: ArtistId,
    public readonly syncedAt: Date
  ) {
    super(collectionId.toString(), collectionId.toString());
  }
}