import { AggregateRoot } from '../../../../core/src/entities';
import { PostId } from '../value-objects/PostId';
import { UserId } from '../value-objects/UserId';
import { PostMetadata } from '../value-objects/PostMetadata';
import { PostDownloadRequested } from '../events/PostDownloadRequested';
import { PostDownloaded } from '../events/PostDownloaded';
import { PostSaved } from '../events/PostSaved';

export class Post extends AggregateRoot {
  private constructor(
    private readonly id: PostId,
    private readonly authorId: UserId,
    private metadata: PostMetadata,
    private localPath?: string,
    private downloadedAt?: Date,
    private savedAt?: Date
  ) {
    super();
  }

  static create(
    id: PostId,
    authorId: UserId,
    metadata: PostMetadata
  ): Post {
    const post = new Post(id, authorId, metadata);
    post.savedAt = new Date();
    post.addDomainEvent(
      new PostSaved(id, authorId, metadata, post.savedAt)
    );
    return post;
  }

  requestDownload(): void {
    if (this.isDownloaded()) {
      throw new Error('Post is already downloaded');
    }
    this.addDomainEvent(
      new PostDownloadRequested(this.id, this.authorId, this.metadata, new Date())
    );
  }

  markAsDownloaded(localPath: string): void {
    this.localPath = localPath;
    this.downloadedAt = new Date();
    this.addDomainEvent(
      new PostDownloaded(
        this.id,
        this.authorId,
        localPath,
        this.downloadedAt
      )
    );
  }

  updateMetadata(metadata: PostMetadata): void {
    this.metadata = metadata;
  }

  getId(): PostId {
    return this.id;
  }

  getAuthorId(): UserId {
    return this.authorId;
  }

  getMetadata(): PostMetadata {
    return this.metadata;
  }

  getLocalPath(): string | undefined {
    return this.localPath;
  }

  isDownloaded(): boolean {
    return !!this.downloadedAt;
  }

  getSavedAt(): Date | undefined {
    return this.savedAt;
  }

  getDownloadedAt(): Date | undefined {
    return this.downloadedAt;
  }

  protected apply(event: any): void {
    // Event sourcing implementation would go here
  }
}