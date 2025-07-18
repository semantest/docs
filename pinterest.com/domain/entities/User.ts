import { Entity } from '../../../shared/domain/Entity';
import { UserId } from '../value-objects/UserId';

export class User extends Entity {
  private constructor(
    private readonly id: UserId,
    private username: string,
    private displayName: string,
    private bio: string,
    private profileImageUrl: string,
    private followerCount: number,
    private followingCount: number,
    private boardCount: number,
    private pinCount: number
  ) {
    super();
  }

  static create(
    id: UserId,
    username: string,
    displayName: string,
    bio: string,
    profileImageUrl: string,
    followerCount: number = 0,
    followingCount: number = 0,
    boardCount: number = 0,
    pinCount: number = 0
  ): User {
    return new User(
      id,
      username,
      displayName,
      bio,
      profileImageUrl,
      followerCount,
      followingCount,
      boardCount,
      pinCount
    );
  }

  getId(): UserId {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getBio(): string {
    return this.bio;
  }

  getProfileImageUrl(): string {
    return this.profileImageUrl;
  }

  getFollowerCount(): number {
    return this.followerCount;
  }

  getFollowingCount(): number {
    return this.followingCount;
  }

  getBoardCount(): number {
    return this.boardCount;
  }

  getPinCount(): number {
    return this.pinCount;
  }

  updateStats(
    followerCount: number,
    followingCount: number,
    boardCount: number,
    pinCount: number
  ): void {
    this.followerCount = followerCount;
    this.followingCount = followingCount;
    this.boardCount = boardCount;
    this.pinCount = pinCount;
  }
}