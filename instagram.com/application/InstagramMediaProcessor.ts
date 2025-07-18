import { InstagramApiAdapter } from '../infrastructure/adapters/interfaces/InstagramApiAdapter';
import { InstagramContentScraper } from '../infrastructure/adapters/interfaces/InstagramContentScraper';
import { Post } from '../domain/entities/Post';
import { Story } from '../domain/entities/Story';
import { Reel } from '../domain/entities/Reel';
import { User } from '../domain/entities/User';
import { PostId } from '../domain/value-objects/PostId';
import { StoryId } from '../domain/value-objects/StoryId';
import { ReelId } from '../domain/value-objects/ReelId';
import { UserId } from '../domain/value-objects/UserId';

export class InstagramMediaProcessor {
  constructor(
    private readonly apiAdapter: InstagramApiAdapter,
    private readonly contentScraper: InstagramContentScraper
  ) {}

  async processPost(postUrl: string): Promise<Post> {
    // Validate URL
    if (!this.contentScraper.validatePostUrl(postUrl)) {
      throw new Error('Invalid Instagram post URL');
    }

    // Extract post ID and scrape metadata
    const postId = this.contentScraper.extractPostId(postUrl);
    const metadata = await this.contentScraper.scrapePost(postUrl);
    
    // Get post from API
    const post = await this.apiAdapter.getPost(postId);
    
    // Request download
    post.requestDownload();
    
    return post;
  }

  async processStory(storyUrl: string): Promise<Story> {
    // Validate URL
    if (!this.contentScraper.validateStoryUrl(storyUrl)) {
      throw new Error('Invalid Instagram story URL');
    }

    // Extract story ID and scrape metadata
    const storyId = this.contentScraper.extractStoryId(storyUrl);
    const story = await this.apiAdapter.getStory(storyId);
    
    return story;
  }

  async processReel(reelUrl: string): Promise<Reel> {
    // Validate URL
    if (!this.contentScraper.validateReelUrl(reelUrl)) {
      throw new Error('Invalid Instagram reel URL');
    }

    // Extract reel ID and scrape metadata
    const reelId = this.contentScraper.extractReelId(reelUrl);
    const reel = await this.apiAdapter.getReel(reelId);
    
    return reel;
  }

  async processUser(userUrl: string): Promise<User> {
    // Validate URL
    if (!this.contentScraper.validateUserUrl(userUrl)) {
      throw new Error('Invalid Instagram user URL');
    }

    // Extract user ID
    const userId = this.contentScraper.extractUserId(userUrl);
    const user = await this.apiAdapter.getUser(userId);
    
    return user;
  }

  async downloadPost(postId: PostId): Promise<string> {
    const localPath = await this.apiAdapter.downloadPost(postId);
    
    // Mark post as downloaded
    const post = await this.apiAdapter.getPost(postId);
    post.markAsDownloaded(localPath);
    
    return localPath;
  }

  async downloadStory(storyId: StoryId): Promise<string> {
    const localPath = await this.apiAdapter.downloadStory(storyId);
    
    // Mark story as downloaded
    const story = await this.apiAdapter.getStory(storyId);
    story.markAsDownloaded(localPath);
    
    return localPath;
  }

  async downloadReel(reelId: ReelId): Promise<string> {
    const localPath = await this.apiAdapter.downloadReel(reelId);
    
    // Mark reel as downloaded
    const reel = await this.apiAdapter.getReel(reelId);
    reel.markAsDownloaded(localPath);
    
    return localPath;
  }

  async followUser(userId: UserId): Promise<void> {
    await this.apiAdapter.followUser(userId);
    
    // Update user follow status
    const user = await this.apiAdapter.getUser(userId);
    user.follow();
  }

  async searchContent(query: string, type: 'posts' | 'reels' | 'users'): Promise<Post[] | Reel[] | User[]> {
    switch (type) {
      case 'posts':
        return await this.apiAdapter.searchPosts(query);
      case 'reels':
        return await this.apiAdapter.searchReels(query);
      case 'users':
        return await this.apiAdapter.searchUsers(query);
      default:
        throw new Error(`Unsupported search type: ${type}`);
    }
  }
}