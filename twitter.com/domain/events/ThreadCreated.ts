import { DomainEvent } from '../../../../core/src/events';
import { ThreadId } from '../value-objects/ThreadId';
import { UserId } from '../value-objects/UserId';
import { ThreadProps } from '../entities/Thread';

export class ThreadCreated extends DomainEvent {
  public readonly eventType = 'twitter.thread.created';

  constructor(
    public readonly threadId: ThreadId,
    public readonly authorId: UserId,
    public readonly props: ThreadProps,
    public readonly createdAt: Date
  ) {
    super(threadId.toString(), threadId.toString());
  }
}