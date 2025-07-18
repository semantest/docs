import { DomainEvent } from '../../../../core/src/events';
import { ReelId } from '../value-objects/ReelId';
import { UserId } from '../value-objects/UserId';
import { ReelProps } from '../entities/Reel';

export class ReelSaved extends DomainEvent {
  public readonly eventType = 'instagram.reel.saved';

  constructor(
    public readonly reelId: ReelId,
    public readonly authorId: UserId,
    public readonly props: ReelProps,
    public readonly savedAt: Date
  ) {
    super(reelId.toString(), reelId.toString());
  }
}