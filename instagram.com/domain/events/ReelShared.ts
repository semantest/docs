import { DomainEvent } from '../../../../core/src/events';
import { ReelId } from '../value-objects/ReelId';
import { UserId } from '../value-objects/UserId';

export class ReelShared extends DomainEvent {
  public readonly eventType = 'instagram.reel.shared';

  constructor(
    public readonly reelId: ReelId,
    public readonly authorId: UserId,
    public readonly sharedAt: Date
  ) {
    super(reelId.toString(), reelId.toString());
  }
}