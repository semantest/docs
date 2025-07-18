import { VideoId } from '../../../domain/value-objects/VideoId';
import { VideoMetadata } from '../../../domain/value-objects/VideoMetadata';
import { VideoQuality } from '../../../domain/value-objects/VideoQuality';
import { ChannelId } from '../../../domain/value-objects/ChannelId';
import { PlaylistId } from '../../../domain/value-objects/PlaylistId';
import { Channel } from '../../../domain/entities/Channel';
import { Playlist } from '../../../domain/entities/Playlist';

export interface YouTubeApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface VideoDownloadInfo {
  videoId: VideoId;
  downloadUrl: string;
  quality: VideoQuality;
  fileSize: number;
  format: string;
}

export interface YouTubeApiAdapter {
  /**
   * Fetch video metadata from YouTube API
   */
  getVideoMetadata(videoId: VideoId): Promise<VideoMetadata>;

  /**
   * Get available download URLs for a video
   */
  getVideoDownloadInfo(videoId: VideoId, quality: VideoQuality): Promise<VideoDownloadInfo>;

  /**
   * Fetch channel information
   */
  getChannelInfo(channelId: ChannelId): Promise<Channel>;

  /**
   * Fetch playlist information and video IDs
   */
  getPlaylistInfo(playlistId: PlaylistId): Promise<Playlist>;

  /**
   * Get videos from a playlist
   */
  getPlaylistVideos(playlistId: PlaylistId): Promise<VideoId[]>;

  /**
   * Search for videos
   */
  searchVideos(query: string, maxResults?: number): Promise<VideoId[]>;

  /**
   * Get trending videos
   */
  getTrendingVideos(category?: string, maxResults?: number): Promise<VideoId[]>;

  /**
   * Validate API key and connection
   */
  validateConnection(): Promise<boolean>;
}