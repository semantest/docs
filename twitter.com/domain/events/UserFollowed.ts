import { DomainEvent } from '../../../../core/src/events';
import { UserId } from '../value-objects/UserId';

export class UserFollowed extends DomainEvent {
  public readonly eventType = 'twitter.user.followed';

  constructor(
    public readonly userId: UserId,
    public readonly username: string,
    public readonly followedAt: Date
  ) {
    super(userId.toString(), userId.toString());
  }
}