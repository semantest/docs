import { PostMetadata } from '../../../domain/value-objects/PostMetadata';
import { PostId } from '../../../domain/value-objects/PostId';
import { StoryId } from '../../../domain/value-objects/StoryId';
import { ReelId } from '../../../domain/value-objects/ReelId';
import { UserId } from '../../../domain/value-objects/UserId';

export interface InstagramContentScraper {
  // Content scraping
  scrapePost(postUrl: string): Promise<PostMetadata>;
  scrapeStory(storyUrl: string): Promise<{
    mediaUrl: string;
    mediaType: 'image' | 'video';
    duration?: number;
    expiresAt: Date;
  }>;
  scrapeReel(reelUrl: string): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    caption: string;
    duration: number;
    hashtags: string[];
  }>;
  
  // Media download
  downloadMedia(mediaUrl: string, filename: string): Promise<string>;
  downloadVideo(videoUrl: string, filename: string): Promise<string>;
  downloadImage(imageUrl: string, filename: string): Promise<string>;
  
  // Content validation
  validatePostUrl(url: string): boolean;
  validateStoryUrl(url: string): boolean;
  validateReelUrl(url: string): boolean;
  validateUserUrl(url: string): boolean;
  
  // Metadata extraction
  extractPostId(url: string): PostId;
  extractStoryId(url: string): StoryId;
  extractReelId(url: string): ReelId;
  extractUserId(url: string): UserId;
}