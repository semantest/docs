import { VideoId } from '../domain/value-objects/VideoId';
import { VideoQuality } from '../domain/value-objects/VideoQuality';
import { Video } from '../domain/entities/Video';
import { YouTubeApiAdapter } from '../infrastructure/adapters/interfaces/YouTubeApiAdapter';
import { VideoRepository } from '../domain/repositories/VideoRepository';
import { DomainEventPublisher } from '../../shared/domain/DomainEventPublisher';

export class VideoDownloadService {
  constructor(
    private readonly youtubeApi: YouTubeApiAdapter,
    private readonly videoRepository: VideoRepository,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  async downloadVideo(videoId: VideoId, quality: VideoQuality): Promise<Video> {
    // Get video metadata
    const metadata = await this.youtubeApi.getVideoMetadata(videoId);
    
    // Create video entity
    const video = Video.create(videoId, metadata, quality);
    
    // Get download info
    const downloadInfo = await this.youtubeApi.getVideoDownloadInfo(videoId, quality);
    
    // Mark as downloaded
    video.markAsDownloaded(downloadInfo.downloadUrl);
    
    // Save to repository
    await this.videoRepository.save(video);
    
    // Publish domain events
    await this.eventPublisher.publishAll(video.getDomainEvents());
    
    return video;
  }

  async getVideoStatus(videoId: VideoId): Promise<Video | null> {
    return await this.videoRepository.findById(videoId);
  }
}