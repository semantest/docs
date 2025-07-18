import { YouTubeApiAdapter, YouTubeApiResponse, VideoDownloadInfo } from './interfaces/YouTubeApiAdapter';
import { VideoId } from '../../domain/value-objects/VideoId';
import { VideoMetadata } from '../../domain/value-objects/VideoMetadata';
import { VideoQuality } from '../../domain/value-objects/VideoQuality';
import { ChannelId } from '../../domain/value-objects/ChannelId';
import { PlaylistId } from '../../domain/value-objects/PlaylistId';
import { Channel } from '../../domain/entities/Channel';
import { Playlist } from '../../domain/entities/Playlist';

export class YouTubeApiAdapterImpl implements YouTubeApiAdapter {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getVideoMetadata(videoId: VideoId): Promise<VideoMetadata> {
    const url = `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoId.getValue()}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error(`Video not found: ${videoId.getValue()}`);
    }
    
    const item = data.items[0];
    const snippet = item.snippet;
    const statistics = item.statistics;
    const contentDetails = item.contentDetails;
    
    return new VideoMetadata({
      title: snippet.title,
      description: snippet.description,
      duration: this.parseDuration(contentDetails.duration),
      publishedAt: new Date(snippet.publishedAt),
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle,
      thumbnailUrl: snippet.thumbnails.high.url,
      viewCount: parseInt(statistics.viewCount) || 0,
      likeCount: parseInt(statistics.likeCount) || 0,
      tags: snippet.tags || []
    });
  }

  async getVideoDownloadInfo(videoId: VideoId, quality: VideoQuality): Promise<VideoDownloadInfo> {
    // Note: This is a placeholder implementation
    // In a real implementation, you'd need to use a service like youtube-dl
    // or similar to extract download URLs
    throw new Error('Video download info extraction not implemented. Use youtube-dl or similar service.');
  }

  async getChannelInfo(channelId: ChannelId): Promise<Channel> {
    const url = `${this.baseUrl}/channels?part=snippet,statistics&id=${channelId.getValue()}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error(`Channel not found: ${channelId.getValue()}`);
    }
    
    const item = data.items[0];
    const snippet = item.snippet;
    const statistics = item.statistics;
    
    return Channel.create(
      channelId,
      snippet.title,
      snippet.description,
      parseInt(statistics.subscriberCount) || 0,
      parseInt(statistics.videoCount) || 0,
      snippet.thumbnails.high.url
    );
  }

  async getPlaylistInfo(playlistId: PlaylistId): Promise<Playlist> {
    const url = `${this.baseUrl}/playlists?part=snippet&id=${playlistId.getValue()}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error(`Playlist not found: ${playlistId.getValue()}`);
    }
    
    const item = data.items[0];
    const snippet = item.snippet;
    
    return Playlist.create(
      playlistId,
      snippet.title,
      snippet.description,
      snippet.channelId,
      snippet.privacy !== 'private'
    );
  }

  async getPlaylistVideos(playlistId: PlaylistId): Promise<VideoId[]> {
    const url = `${this.baseUrl}/playlistItems?part=snippet&playlistId=${playlistId.getValue()}&maxResults=50&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    return data.items.map((item: any) => new VideoId(item.snippet.resourceId.videoId));
  }

  async searchVideos(query: string, maxResults: number = 25): Promise<VideoId[]> {
    const url = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    return data.items.map((item: any) => new VideoId(item.id.videoId));
  }

  async getTrendingVideos(category?: string, maxResults: number = 25): Promise<VideoId[]> {
    let url = `${this.baseUrl}/videos?part=snippet&chart=mostPopular&maxResults=${maxResults}&key=${this.apiKey}`;
    
    if (category) {
      url += `&videoCategoryId=${category}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    return data.items.map((item: any) => new VideoId(item.id));
  }

  async validateConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/search?part=snippet&q=test&type=video&maxResults=1&key=${this.apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private parseDuration(isoDuration: string): number {
    // Convert ISO 8601 duration to seconds
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    
    if (!matches) return 0;
    
    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');
    const seconds = parseInt(matches[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}