import { DomainEvent } from '../../../../core/src/events';
import { ArtistId } from '../value-objects/ArtistId';

export class ArtistFollowed extends DomainEvent {
  public readonly eventType = 'unsplash.artist.followed';

  constructor(
    public readonly artistId: ArtistId,
    public readonly username: string,
    public readonly followedAt: Date
  ) {
    super(artistId.toString(), artistId.toString());
  }
}