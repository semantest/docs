import { Video } from '../entities/Video';
import { VideoId } from '../value-objects/VideoId';

export interface VideoRepository {
  save(video: Video): Promise<void>;
  findById(id: VideoId): Promise<Video | null>;
  findByChannelId(channelId: string): Promise<Video[]>;
  findDownloadedVideos(): Promise<Video[]>;
  delete(id: VideoId): Promise<void>;
}