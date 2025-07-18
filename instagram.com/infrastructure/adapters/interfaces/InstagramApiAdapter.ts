import { Post } from '../../../domain/entities/Post';
import { Story } from '../../../domain/entities/Story';
import { Reel } from '../../../domain/entities/Reel';
import { User } from '../../../domain/entities/User';
import { PostId } from '../../../domain/value-objects/PostId';
import { StoryId } from '../../../domain/value-objects/StoryId';
import { ReelId } from '../../../domain/value-objects/ReelId';
import { UserId } from '../../../domain/value-objects/UserId';

export interface InstagramApiAdapter {
  // User operations
  getUser(userId: UserId): Promise<User>;
  getUserByUsername(username: string): Promise<User>;
  followUser(userId: UserId): Promise<void>;
  unfollowUser(userId: UserId): Promise<void>;
  
  // Post operations
  getPost(postId: PostId): Promise<Post>;
  getUserPosts(userId: UserId, limit?: number): Promise<Post[]>;
  downloadPost(postId: PostId): Promise<string>; // Returns local path
  
  // Story operations
  getStory(storyId: StoryId): Promise<Story>;
  getUserStories(userId: UserId): Promise<Story[]>;
  downloadStory(storyId: StoryId): Promise<string>; // Returns local path
  
  // Reel operations
  getReel(reelId: ReelId): Promise<Reel>;
  getUserReels(userId: UserId, limit?: number): Promise<Reel[]>;
  downloadReel(reelId: ReelId): Promise<string>; // Returns local path
  
  // Search operations
  searchUsers(query: string, limit?: number): Promise<User[]>;
  searchPosts(hashtag: string, limit?: number): Promise<Post[]>;
  searchReels(query: string, limit?: number): Promise<Reel[]>;
  
  // Engagement operations
  likePost(postId: PostId): Promise<void>;
  commentOnPost(postId: PostId, comment: string): Promise<void>;
  shareReel(reelId: ReelId): Promise<void>;
  
  // Analytics operations
  getPostEngagement(postId: PostId): Promise<{
    likes: number;
    comments: number;
    shares: number;
    views: number;
  }>;
  
  getUserAnalytics(userId: UserId): Promise<{
    followers: number;
    following: number;
    posts: number;
    engagement: number;
  }>;
}