import { ValueObject } from '../../../shared/domain/ValueObject';

export interface PinMetadataProps {
  title: string;
  description: string;
  imageUrl: string;
  originalImageUrl: string;
  sourceUrl?: string;
  width: number;
  height: number;
  createdAt: Date;
  creatorId: string;
  creatorName: string;
  boardId?: string;
  boardName?: string;
  repinCount: number;
  commentCount: number;
  tags: string[];
}

export class PinMetadata extends ValueObject {
  constructor(private readonly props: PinMetadataProps) {
    super();
    this.validate();
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Pin title cannot be empty');
    }
    if (!this.props.imageUrl || !this.props.originalImageUrl) {
      throw new Error('Pin must have image URLs');
    }
    if (this.props.width <= 0 || this.props.height <= 0) {
      throw new Error('Pin dimensions must be positive');
    }
    if (this.props.repinCount < 0 || this.props.commentCount < 0) {
      throw new Error('Pin counts cannot be negative');
    }
  }

  getTitle(): string {
    return this.props.title;
  }

  getDescription(): string {
    return this.props.description;
  }

  getImageUrl(): string {
    return this.props.imageUrl;
  }

  getOriginalImageUrl(): string {
    return this.props.originalImageUrl;
  }

  getSourceUrl(): string | undefined {
    return this.props.sourceUrl;
  }

  getWidth(): number {
    return this.props.width;
  }

  getHeight(): number {
    return this.props.height;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getCreatorId(): string {
    return this.props.creatorId;
  }

  getCreatorName(): string {
    return this.props.creatorName;
  }

  getBoardId(): string | undefined {
    return this.props.boardId;
  }

  getBoardName(): string | undefined {
    return this.props.boardName;
  }

  getRepinCount(): number {
    return this.props.repinCount;
  }

  getCommentCount(): number {
    return this.props.commentCount;
  }

  getTags(): string[] {
    return [...this.props.tags];
  }

  getAspectRatio(): number {
    return this.props.width / this.props.height;
  }

  isLandscape(): boolean {
    return this.getAspectRatio() > 1;
  }

  isPortrait(): boolean {
    return this.getAspectRatio() < 1;
  }

  isSquare(): boolean {
    return Math.abs(this.getAspectRatio() - 1) < 0.01;
  }
}