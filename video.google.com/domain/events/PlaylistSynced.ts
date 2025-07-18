import { DomainEvent } from '../../../shared/domain/DomainEvent';
import { PlaylistId } from '../value-objects/PlaylistId';
import { VideoId } from '../value-objects/VideoId';

export class PlaylistSynced extends DomainEvent {
  constructor(
    public readonly playlistId: PlaylistId,
    public readonly videoIds: VideoId[],
    occurredOn: Date
  ) {
    super('playlist.synced', occurredOn);
  }
}