import { ValueObject } from '../../../shared/domain/ValueObject';

export enum QualityLevel {
  LOW = '144p',
  MEDIUM = '360p',
  HIGH = '720p',
  FULL_HD = '1080p',
  FOUR_K = '2160p'
}

export class VideoQuality extends ValueObject {
  constructor(private readonly level: QualityLevel) {
    super();
  }

  static low(): VideoQuality {
    return new VideoQuality(QualityLevel.LOW);
  }

  static medium(): VideoQuality {
    return new VideoQuality(QualityLevel.MEDIUM);
  }

  static high(): VideoQuality {
    return new VideoQuality(QualityLevel.HIGH);
  }

  static fullHd(): VideoQuality {
    return new VideoQuality(QualityLevel.FULL_HD);
  }

  static fourK(): VideoQuality {
    return new VideoQuality(QualityLevel.FOUR_K);
  }

  getLevel(): QualityLevel {
    return this.level;
  }

  isHighDefinition(): boolean {
    return this.level === QualityLevel.HIGH || 
           this.level === QualityLevel.FULL_HD || 
           this.level === QualityLevel.FOUR_K;
  }

  getResolution(): string {
    return this.level;
  }

  toString(): string {
    return this.level;
  }
}