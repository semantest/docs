import { AggregateRoot } from '../../../../core/src/entities';
import { CollectionId } from '../value-objects/CollectionId';
import { ArtistId } from '../value-objects/ArtistId';
import { PhotoId } from '../value-objects/PhotoId';
import { CollectionCreated } from '../events/CollectionCreated';
import { CollectionSynced } from '../events/CollectionSynced';
import { PhotoAddedToCollection } from '../events/PhotoAddedToCollection';

export interface CollectionProps {
  title: string;
  description?: string;
  isPrivate: boolean;
  coverPhotoId?: PhotoId;
  totalPhotos: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Collection extends AggregateRoot {
  private constructor(
    private readonly id: CollectionId,
    private readonly curatorId: ArtistId,
    private props: CollectionProps,
    private photos: PhotoId[] = [],
    private syncedAt?: Date
  ) {
    super();
  }

  static create(
    id: CollectionId,
    curatorId: ArtistId,
    props: CollectionProps
  ): Collection {
    const collection = new Collection(id, curatorId, props);
    collection.addDomainEvent(
      new CollectionCreated(id, curatorId, props, new Date())
    );
    return collection;
  }

  addPhoto(photoId: PhotoId): void {
    if (this.photos.includes(photoId)) {
      throw new Error('Photo is already in collection');
    }
    this.photos.push(photoId);
    this.props.totalPhotos += 1;
    this.addDomainEvent(
      new PhotoAddedToCollection(this.id, photoId, this.curatorId, new Date())
    );
  }

  removePhoto(photoId: PhotoId): void {
    const index = this.photos.indexOf(photoId);
    if (index === -1) {
      throw new Error('Photo is not in collection');
    }
    this.photos.splice(index, 1);
    this.props.totalPhotos -= 1;
  }

  setCoverPhoto(photoId: PhotoId): void {
    if (!this.photos.includes(photoId)) {
      throw new Error('Photo must be in collection to set as cover');
    }
    this.props.coverPhotoId = photoId;
  }

  makePrivate(): void {
    this.props.isPrivate = true;
  }

  makePublic(): void {
    this.props.isPrivate = false;
  }

  sync(): void {
    this.syncedAt = new Date();
    this.addDomainEvent(
      new CollectionSynced(this.id, this.curatorId, this.syncedAt)
    );
  }

  updateMetadata(updates: Partial<Pick<CollectionProps, 'title' | 'description' | 'tags'>>): void {
    this.props = { ...this.props, ...updates, updatedAt: new Date() };
  }

  getId(): CollectionId {
    return this.id;
  }

  getCuratorId(): ArtistId {
    return this.curatorId;
  }

  getTitle(): string {
    return this.props.title;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  isPrivate(): boolean {
    return this.props.isPrivate;
  }

  getCoverPhotoId(): PhotoId | undefined {
    return this.props.coverPhotoId;
  }

  getTotalPhotos(): number {
    return this.props.totalPhotos;
  }

  getTags(): string[] {
    return [...this.props.tags];
  }

  getPhotos(): PhotoId[] {
    return [...this.photos];
  }

  getSyncedAt(): Date | undefined {
    return this.syncedAt;
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