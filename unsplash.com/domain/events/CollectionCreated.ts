import { DomainEvent } from '../../../../core/src/events';
import { CollectionId } from '../value-objects/CollectionId';
import { ArtistId } from '../value-objects/ArtistId';
import { CollectionProps } from '../entities/Collection';

export class CollectionCreated extends DomainEvent {
  public readonly eventType = 'unsplash.collection.created';

  constructor(
    public readonly collectionId: CollectionId,
    public readonly curatorId: ArtistId,
    public readonly props: CollectionProps,
    public readonly createdAt: Date
  ) {
    super(collectionId.toString(), collectionId.toString());
  }
}