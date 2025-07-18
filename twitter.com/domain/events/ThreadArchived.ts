import { DomainEvent } from '../../../../core/src/events';
import { ThreadId } from '../value-objects/ThreadId';
import { UserId } from '../value-objects/UserId';

export class ThreadArchived extends DomainEvent {
  public readonly eventType = 'twitter.thread.archived';

  constructor(
    public readonly threadId: ThreadId,
    public readonly authorId: UserId,
    public readonly archivedAt: Date
  ) {
    super(threadId.toString(), threadId.toString());
  }
}