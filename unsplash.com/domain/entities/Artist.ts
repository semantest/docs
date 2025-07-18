import { AggregateRoot } from '../../../../core/src/entities';
import { ArtistId } from '../value-objects/ArtistId';
import { ArtistFollowed } from '../events/ArtistFollowed';
import { ArtistProfileUpdated } from '../events/ArtistProfileUpdated';

export interface ArtistProfile {
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  portfolioUrl?: string;
  instagramUsername?: string;
  twitterUsername?: string;
  profileImageUrl?: string;
  totalPhotos: number;
  totalLikes: number;
  totalViews: number;
  totalDownloads: number;
  followersCount: number;
  followingCount: number;
  isForHire: boolean;
  acceptsDonations: boolean;
}

export class Artist extends AggregateRoot {
  private constructor(
    private readonly id: ArtistId,
    private profile: ArtistProfile,
    private followedAt?: Date
  ) {
    super();
  }

  static create(
    id: ArtistId,
    profile: ArtistProfile
  ): Artist {
    return new Artist(id, profile);
  }

  follow(): void {
    if (this.isFollowed()) {
      throw new Error('Artist is already followed');
    }
    this.followedAt = new Date();
    this.addDomainEvent(
      new ArtistFollowed(this.id, this.profile.username, this.followedAt)
    );
  }

  unfollow(): void {
    this.followedAt = undefined;
  }

  updateProfile(updates: Partial<ArtistProfile>): void {
    const oldProfile = { ...this.profile };
    this.profile = { ...this.profile, ...updates };
    this.addDomainEvent(
      new ArtistProfileUpdated(this.id, oldProfile, this.profile, new Date())
    );
  }

  updateStats(stats: {
    totalPhotos: number;
    totalLikes: number;
    totalViews: number;
    totalDownloads: number;
    followersCount: number;
    followingCount: number;
  }): void {
    this.profile = { ...this.profile, ...stats };
  }

  setForHire(isForHire: boolean): void {
    this.profile.isForHire = isForHire;
  }

  setAcceptsDonations(acceptsDonations: boolean): void {
    this.profile.acceptsDonations = acceptsDonations;
  }

  isFollowed(): boolean {
    return !!this.followedAt;
  }

  getId(): ArtistId {
    return this.id;
  }

  getUsername(): string {
    return this.profile.username;
  }

  getFullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  getFirstName(): string {
    return this.profile.firstName;
  }

  getLastName(): string {
    return this.profile.lastName;
  }

  getBio(): string | undefined {
    return this.profile.bio;
  }

  getLocation(): string | undefined {
    return this.profile.location;
  }

  getPortfolioUrl(): string | undefined {
    return this.profile.portfolioUrl;
  }

  getInstagramUsername(): string | undefined {
    return this.profile.instagramUsername;
  }

  getTwitterUsername(): string | undefined {
    return this.profile.twitterUsername;
  }

  getProfileImageUrl(): string | undefined {
    return this.profile.profileImageUrl;
  }

  getTotalPhotos(): number {
    return this.profile.totalPhotos;
  }

  getTotalLikes(): number {
    return this.profile.totalLikes;
  }

  getTotalViews(): number {
    return this.profile.totalViews;
  }

  getTotalDownloads(): number {
    return this.profile.totalDownloads;
  }

  getFollowersCount(): number {
    return this.profile.followersCount;
  }

  getFollowingCount(): number {
    return this.profile.followingCount;
  }

  isForHire(): boolean {
    return this.profile.isForHire;
  }

  acceptsDonations(): boolean {
    return this.profile.acceptsDonations;
  }

  getFollowedAt(): Date | undefined {
    return this.followedAt;
  }

  getProfile(): ArtistProfile {
    return { ...this.profile };
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}