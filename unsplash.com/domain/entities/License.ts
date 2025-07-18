import { AggregateRoot } from '../../../../core/src/entities';
import { PhotoId } from '../value-objects/PhotoId';
import { ArtistId } from '../value-objects/ArtistId';

export interface LicenseProps {
  type: 'free' | 'plus' | 'premium';
  name: string;
  description: string;
  allowsCommercialUse: boolean;
  requiresAttribution: boolean;
  allowsModification: boolean;
  allowsDistribution: boolean;
  restrictions: string[];
  expiresAt?: Date;
  downloadLimit?: number;
  maxResolution?: string;
}

export class License extends AggregateRoot {
  private constructor(
    private readonly photoId: PhotoId,
    private readonly artistId: ArtistId,
    private props: LicenseProps,
    private acquiredAt?: Date,
    private usageCount: number = 0
  ) {
    super();
  }

  static create(
    photoId: PhotoId,
    artistId: ArtistId,
    props: LicenseProps
  ): License {
    return new License(photoId, artistId, props);
  }

  acquire(): void {
    if (this.isAcquired()) {
      throw new Error('License is already acquired');
    }
    this.acquiredAt = new Date();
  }

  use(): void {
    if (!this.isAcquired()) {
      throw new Error('License must be acquired before use');
    }
    if (this.isExpired()) {
      throw new Error('License has expired');
    }
    if (this.hasReachedDownloadLimit()) {
      throw new Error('Download limit reached');
    }
    this.usageCount += 1;
  }

  isExpired(): boolean {
    return !!this.props.expiresAt && new Date() > this.props.expiresAt;
  }

  hasReachedDownloadLimit(): boolean {
    return !!this.props.downloadLimit && this.usageCount >= this.props.downloadLimit;
  }

  isAcquired(): boolean {
    return !!this.acquiredAt;
  }

  canUseCommercially(): boolean {
    return this.props.allowsCommercialUse;
  }

  requiresAttribution(): boolean {
    return this.props.requiresAttribution;
  }

  allowsModification(): boolean {
    return this.props.allowsModification;
  }

  allowsDistribution(): boolean {
    return this.props.allowsDistribution;
  }

  getPhotoId(): PhotoId {
    return this.photoId;
  }

  getArtistId(): ArtistId {
    return this.artistId;
  }

  getType(): 'free' | 'plus' | 'premium' {
    return this.props.type;
  }

  getName(): string {
    return this.props.name;
  }

  getDescription(): string {
    return this.props.description;
  }

  getRestrictions(): string[] {
    return [...this.props.restrictions];
  }

  getExpiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  getDownloadLimit(): number | undefined {
    return this.props.downloadLimit;
  }

  getMaxResolution(): string | undefined {
    return this.props.maxResolution;
  }

  getAcquiredAt(): Date | undefined {
    return this.acquiredAt;
  }

  getUsageCount(): number {
    return this.usageCount;
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}