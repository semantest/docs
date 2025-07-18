import { AggregateRoot } from '../../../../core/src/entities';
import { PhotoId } from '../value-objects/PhotoId';
import { ArtistId } from '../value-objects/ArtistId';
import { PhotoDownloadRequested } from '../events/PhotoDownloadRequested';
import { PhotoDownloaded } from '../events/PhotoDownloaded';
import { PhotoLiked } from '../events/PhotoLiked';

export interface PhotoProps {
  title: string;
  description?: string;
  url: string;
  downloadUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  color: string;
  likes: number;
  downloads: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Photo extends AggregateRoot {
  private constructor(
    private readonly id: PhotoId,
    private readonly artistId: ArtistId,
    private props: PhotoProps,
    private localPath?: string,
    private downloadedAt?: Date,
    private likedAt?: Date
  ) {
    super();
  }

  static create(
    id: PhotoId,
    artistId: ArtistId,
    props: PhotoProps
  ): Photo {
    return new Photo(id, artistId, props);
  }

  requestDownload(): void {
    if (this.isDownloaded()) {
      throw new Error('Photo is already downloaded');
    }
    this.addDomainEvent(
      new PhotoDownloadRequested(this.id, this.artistId, this.props.downloadUrl, new Date())
    );
  }

  markAsDownloaded(localPath: string): void {
    this.localPath = localPath;
    this.downloadedAt = new Date();
    this.addDomainEvent(
      new PhotoDownloaded(this.id, this.artistId, localPath, this.downloadedAt)
    );
  }

  like(): void {
    if (this.isLiked()) {
      throw new Error('Photo is already liked');
    }
    this.likedAt = new Date();
    this.props.likes += 1;
    this.addDomainEvent(
      new PhotoLiked(this.id, this.artistId, this.likedAt)
    );
  }

  updateEngagement(likes: number, downloads: number): void {
    this.props.likes = likes;
    this.props.downloads = downloads;
  }

  addTag(tag: string): void {
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.props.tags = this.props.tags.filter(t => t !== tag);
  }

  isDownloaded(): boolean {
    return !!this.downloadedAt;
  }

  isLiked(): boolean {
    return !!this.likedAt;
  }

  getId(): PhotoId {
    return this.id;
  }

  getArtistId(): ArtistId {
    return this.artistId;
  }

  getTitle(): string {
    return this.props.title;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  getUrl(): string {
    return this.props.url;
  }

  getDownloadUrl(): string {
    return this.props.downloadUrl;
  }

  getThumbnailUrl(): string {
    return this.props.thumbnailUrl;
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.props.width, height: this.props.height };
  }

  getColor(): string {
    return this.props.color;
  }

  getLikes(): number {
    return this.props.likes;
  }

  getDownloads(): number {
    return this.props.downloads;
  }

  getTags(): string[] {
    return [...this.props.tags];
  }

  getLocalPath(): string | undefined {
    return this.localPath;
  }

  getDownloadedAt(): Date | undefined {
    return this.downloadedAt;
  }

  getLikedAt(): Date | undefined {
    return this.likedAt;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}