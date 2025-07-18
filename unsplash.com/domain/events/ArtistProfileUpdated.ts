import { DomainEvent } from '../../../../core/src/events';
import { ArtistId } from '../value-objects/ArtistId';
import { ArtistProfile } from '../entities/Artist';

export class ArtistProfileUpdated extends DomainEvent {
  public readonly eventType = 'unsplash.artist.profile.updated';

  constructor(
    public readonly artistId: ArtistId,
    public readonly oldProfile: ArtistProfile,
    public readonly newProfile: ArtistProfile,
    public readonly updatedAt: Date
  ) {
    super(artistId.toString(), artistId.toString());
  }
}