import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { BoardId } from '../value-objects/BoardId';
import { PinId } from '../value-objects/PinId';
import { BoardCreated } from '../events/BoardCreated';
import { BoardSynced } from '../events/BoardSynced';

export class Board extends AggregateRoot {
  private pinIds: PinId[] = [];

  private constructor(
    private readonly id: BoardId,
    private name: string,
    private description: string,
    private ownerId: string,
    private isPrivate: boolean = false,
    private createdAt?: Date,
    private lastSyncedAt?: Date
  ) {
    super();
  }

  static create(
    id: BoardId,
    name: string,
    description: string,
    ownerId: string,
    isPrivate: boolean = false
  ): Board {
    const board = new Board(id, name, description, ownerId, isPrivate);
    board.createdAt = new Date();
    board.addDomainEvent(
      new BoardCreated(id, name, description, ownerId, board.createdAt)
    );
    return board;
  }

  addPin(pinId: PinId): void {
    if (!this.pinIds.some(id => id.equals(pinId))) {
      this.pinIds.push(pinId);
    }
  }

  removePin(pinId: PinId): void {
    this.pinIds = this.pinIds.filter(id => !id.equals(pinId));
  }

  syncPins(pinIds: PinId[]): void {
    this.pinIds = pinIds;
    this.lastSyncedAt = new Date();
    this.addDomainEvent(
      new BoardSynced(this.id, pinIds, this.lastSyncedAt)
    );
  }

  getId(): BoardId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getPinIds(): PinId[] {
    return [...this.pinIds];
  }

  getPinCount(): number {
    return this.pinIds.length;
  }

  isPrivate(): boolean {
    return this.isPrivate;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  getLastSyncedAt(): Date | undefined {
    return this.lastSyncedAt;
  }
}