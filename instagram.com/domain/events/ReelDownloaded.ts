import { DomainEvent } from '../../../../core/src/events';
import { ReelId } from '../value-objects/ReelId';
import { UserId } from '../value-objects/UserId';

export class ReelDownloaded extends DomainEvent {
  public readonly eventType = 'instagram.reel.downloaded';

  constructor(
    public readonly reelId: ReelId,
    public readonly authorId: UserId,
    public readonly localPath: string,
    public readonly downloadedAt: Date
  ) {
    super(reelId.toString(), reelId.toString());
  }
}