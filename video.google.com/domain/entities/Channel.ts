import { Entity } from '../../../shared/domain/Entity';
import { ChannelId } from '../value-objects/ChannelId';

export class Channel extends Entity {
  private constructor(
    private readonly id: ChannelId,
    private name: string,
    private description: string,
    private subscriberCount: number,
    private videoCount: number,
    private thumbnailUrl: string
  ) {
    super();
  }

  static create(
    id: ChannelId,
    name: string,
    description: string,
    subscriberCount: number,
    videoCount: number,
    thumbnailUrl: string
  ): Channel {
    return new Channel(
      id,
      name,
      description,
      subscriberCount,
      videoCount,
      thumbnailUrl
    );
  }

  getId(): ChannelId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getSubscriberCount(): number {
    return this.subscriberCount;
  }

  getVideoCount(): number {
    return this.videoCount;
  }

  getThumbnailUrl(): string {
    return this.thumbnailUrl;
  }

  updateStats(subscriberCount: number, videoCount: number): void {
    this.subscriberCount = subscriberCount;
    this.videoCount = videoCount;
  }
}