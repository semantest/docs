import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { PinId } from '../value-objects/PinId';
import { PinMetadata } from '../value-objects/PinMetadata';
import { PinSaved } from '../events/PinSaved';
import { PinDownloaded } from '../events/PinDownloaded';

export class Pin extends AggregateRoot {
  private constructor(
    private readonly id: PinId,
    private metadata: PinMetadata,
    private boardId?: string,
    private localPath?: string,
    private savedAt?: Date,
    private downloadedAt?: Date
  ) {
    super();
  }

  static create(
    id: PinId,
    metadata: PinMetadata,
    boardId?: string
  ): Pin {
    const pin = new Pin(id, metadata, boardId);
    pin.savedAt = new Date();
    pin.addDomainEvent(
      new PinSaved(id, metadata, boardId, pin.savedAt)
    );
    return pin;
  }

  markAsDownloaded(localPath: string): void {
    this.localPath = localPath;
    this.downloadedAt = new Date();
    this.addDomainEvent(
      new PinDownloaded(
        this.id,
        localPath,
        this.downloadedAt
      )
    );
  }

  assignToBoard(boardId: string): void {
    this.boardId = boardId;
  }

  getId(): PinId {
    return this.id;
  }

  getMetadata(): PinMetadata {
    return this.metadata;
  }

  getBoardId(): string | undefined {
    return this.boardId;
  }

  getLocalPath(): string | undefined {
    return this.localPath;
  }

  isDownloaded(): boolean {
    return !!this.downloadedAt;
  }

  getSavedAt(): Date | undefined {
    return this.savedAt;
  }

  getDownloadedAt(): Date | undefined {
    return this.downloadedAt;
  }
}