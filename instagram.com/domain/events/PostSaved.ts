import { DomainEvent } from '../../../../core/src/events';
import { PostId } from '../value-objects/PostId';
import { UserId } from '../value-objects/UserId';
import { PostMetadata } from '../value-objects/PostMetadata';

export class PostSaved extends DomainEvent {
  public readonly eventType = 'instagram.post.saved';

  constructor(
    public readonly postId: PostId,
    public readonly authorId: UserId,
    public readonly metadata: PostMetadata,
    public readonly savedAt: Date
  ) {
    super(postId.toString(), postId.toString());
  }
}