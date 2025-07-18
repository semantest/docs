import { DomainEvent } from '../../../../core/src/events';
import { UserId } from '../value-objects/UserId';
import { UserProfile } from '../entities/User';

export class UserProfileUpdated extends DomainEvent {
  public readonly eventType = 'twitter.user.profile.updated';

  constructor(
    public readonly userId: UserId,
    public readonly oldProfile: UserProfile,
    public readonly newProfile: UserProfile,
    public readonly updatedAt: Date
  ) {
    super(userId.toString(), userId.toString());
  }
}