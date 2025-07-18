import { DomainEvent } from '../../../../core/src/events';
import { PostId } from '../value-objects/PostId';
import { UserId } from '../value-objects/UserId';

export class PostDownloaded extends DomainEvent {
  public readonly eventType = 'instagram.post.downloaded';

  constructor(
    public readonly postId: PostId,
    public readonly authorId: UserId,
    public readonly localPath: string,
    public readonly downloadedAt: Date
  ) {
    super(postId.toString(), postId.toString());
  }
}