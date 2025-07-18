import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { PlaylistId } from '../value-objects/PlaylistId';
import { VideoId } from '../value-objects/VideoId';
import { PlaylistSynced } from '../events/PlaylistSynced';

export class Playlist extends AggregateRoot {
  private videoIds: VideoId[] = [];

  private constructor(
    private readonly id: PlaylistId,
    private title: string,
    private description: string,
    private channelId: string,
    private isPublic: boolean,
    private lastSyncedAt?: Date
  ) {
    super();
  }

  static create(
    id: PlaylistId,
    title: string,
    description: string,
    channelId: string,
    isPublic: boolean = true
  ): Playlist {
    return new Playlist(id, title, description, channelId, isPublic);
  }

  addVideo(videoId: VideoId): void {
    if (!this.videoIds.some(id => id.equals(videoId))) {
      this.videoIds.push(videoId);
    }
  }

  removeVideo(videoId: VideoId): void {
    this.videoIds = this.videoIds.filter(id => !id.equals(videoId));
  }

  syncVideos(videoIds: VideoId[]): void {
    this.videoIds = videoIds;
    this.lastSyncedAt = new Date();
    this.addDomainEvent(
      new PlaylistSynced(
        this.id,
        videoIds,
        this.lastSyncedAt
      )
    );
  }

  getId(): PlaylistId {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getChannelId(): string {
    return this.channelId;
  }

  getVideoIds(): VideoId[] {
    return [...this.videoIds];
  }

  getVideoCount(): number {
    return this.videoIds.length;
  }

  isPublic(): boolean {
    return this.isPublic;
  }

  getLastSyncedAt(): Date | undefined {
    return this.lastSyncedAt;
  }
}