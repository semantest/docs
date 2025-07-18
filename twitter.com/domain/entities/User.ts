import { AggregateRoot } from '../../../../core/src/entities';
import { UserId } from '../value-objects/UserId';
import { UserFollowed } from '../events/UserFollowed';
import { UserProfileUpdated } from '../events/UserProfileUpdated';

export interface UserProfile {
  username: string;
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  isVerified: boolean;
  isProtected: boolean;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  listedCount: number;
  createdAt: Date;
  joinedAt: Date;
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
    return new User(id, profile);
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

  updateStats(stats: {
    followersCount: number;
    followingCount: number;
    tweetsCount: number;
    listedCount: number;
  }): void {
    this.profile = { ...this.profile, ...stats };
  }

  verify(): void {
    this.profile.isVerified = true;
  }

  protect(): void {
    this.profile.isProtected = true;
  }

  unprotect(): void {
    this.profile.isProtected = false;
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

  getLocation(): string | undefined {
    return this.profile.location;
  }

  getWebsite(): string | undefined {
    return this.profile.website;
  }

  getProfileImageUrl(): string | undefined {
    return this.profile.profileImageUrl;
  }

  getBannerImageUrl(): string | undefined {
    return this.profile.bannerImageUrl;
  }

  isVerified(): boolean {
    return this.profile.isVerified;
  }

  isProtected(): boolean {
    return this.profile.isProtected;
  }

  getFollowersCount(): number {
    return this.profile.followersCount;
  }

  getFollowingCount(): number {
    return this.profile.followingCount;
  }

  getTweetsCount(): number {
    return this.profile.tweetsCount;
  }

  getListedCount(): number {
    return this.profile.listedCount;
  }

  getCreatedAt(): Date {
    return this.profile.createdAt;
  }

  getJoinedAt(): Date {
    return this.profile.joinedAt;
  }

  getFollowedAt(): Date | undefined {
    return this.followedAt;
  }

  getProfile(): UserProfile {
    return { ...this.profile };
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}