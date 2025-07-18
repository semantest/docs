import { DomainEvent } from '../../../../core/src/events';
import { PostId } from '../value-objects/PostId';
import { UserId } from '../value-objects/UserId';
import { PostMetadata } from '../value-objects/PostMetadata';

export class PostDownloadRequested extends DomainEvent {
  public readonly eventType = 'instagram.post.download.requested';

  constructor(
    public readonly postId: PostId,
    public readonly authorId: UserId,
    public readonly metadata: PostMetadata,
    occurredOn: Date
  ) {
    super(postId.toString(), postId.toString());
  }
}