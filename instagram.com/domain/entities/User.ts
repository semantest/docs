import { AggregateRoot } from '../../../../core/src/entities';
import { UserId } from '../value-objects/UserId';
import { UserFollowed } from '../events/UserFollowed';
import { UserProfileUpdated } from '../events/UserProfileUpdated';

export interface UserProfile {
  username: string;
  displayName: string;
  bio?: string;
  profilePictureUrl?: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  website?: string;
  location?: string;
}

export class User extends AggregateRoot {
  private constructor(
    private readonly id: UserId,
    private profile: UserProfile,
    private followedAt?: Date
  ) {
    super();
  }

  static create(
    id: UserId,
    profile: UserProfile
  ): User {
    const user = new User(id, profile);
    return user;
  }

  follow(): void {
    if (this.isFollowed()) {
      throw new Error('User is already followed');
    }
    this.followedAt = new Date();
    this.addDomainEvent(
      new UserFollowed(this.id, this.profile.username, this.followedAt)
    );
  }

  unfollow(): void {
    this.followedAt = undefined;
  }

  updateProfile(updates: Partial<UserProfile>): void {
    const oldProfile = { ...this.profile };
    this.profile = { ...this.profile, ...updates };
    this.addDomainEvent(
      new UserProfileUpdated(this.id, oldProfile, this.profile, new Date())
    );
  }

  updateEngagement(followers: number, following: number, posts: number): void {
    this.profile.followersCount = followers;
    this.profile.followingCount = following;
    this.profile.postsCount = posts;
  }

  verify(): void {
    this.profile.isVerified = true;
  }

  makePrivate(): void {
    this.profile.isPrivate = true;
  }

  makePublic(): void {
    this.profile.isPrivate = false;
  }

  isFollowed(): boolean {
    return !!this.followedAt;
  }

  getId(): UserId {
    return this.id;
  }

  getUsername(): string {
    return this.profile.username;
  }

  getDisplayName(): string {
    return this.profile.displayName;
  }

  getBio(): string | undefined {
    return this.profile.bio;
  }

  getProfilePictureUrl(): string | undefined {
    return this.profile.profilePictureUrl;
  }

  isVerified(): boolean {
    return this.profile.isVerified;
  }

  isPrivate(): boolean {
    return this.profile.isPrivate;
  }

  getFollowersCount(): number {
    return this.profile.followersCount;
  }

  getFollowingCount(): number {
    return this.profile.followingCount;
  }

  getPostsCount(): number {
    return this.profile.postsCount;
  }

  getWebsite(): string | undefined {
    return this.profile.website;
  }

  getLocation(): string | undefined {
    return this.profile.location;
  }

  getFollowedAt(): Date | undefined {
    return this.followedAt;
  }

  getProfile(): UserProfile {
    return { ...this.profile };
  }

  protected apply(event: any): void {
    // Event sourcing implementation would go here
  }
}