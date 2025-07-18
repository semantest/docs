# Enhanced Semantest TypeScript Style Guide

Task 034 - Comprehensive TypeScript standards for domain expansion modules

## Overview

This enhanced style guide extends the existing TypeScript standards with domain-specific patterns for the new expansion modules: video.google.com, pinterest.com, instagram.com, unsplash.com, and twitter.com.

## Table of Contents

1. [Domain Module Standards](#domain-module-standards)
2. [Aggregate Root Patterns](#aggregate-root-patterns)
3. [Domain Event Conventions](#domain-event-conventions)
4. [Value Object Standards](#value-object-standards)
5. [Repository Pattern Guidelines](#repository-pattern-guidelines)
6. [Integration Event Patterns](#integration-event-patterns)
7. [Anti-Corruption Layer Standards](#anti-corruption-layer-standards)
8. [Error Handling Integration](#error-handling-integration)
9. [Cross-Module Communication](#cross-module-communication)
10. [Testing Standards](#testing-standards)

## Domain Module Standards

### Module Structure Convention

```typescript
// Standardized module structure for all domain modules
@semantest/{domain}/
├── domain/
│   ├── aggregates/           // Business entities
│   ├── value-objects/        // Immutable data structures
│   ├── events/              // Domain events
│   ├── services/            // Domain services
│   └── errors/              // Domain-specific errors
├── application/
│   ├── commands/            // Command handlers
│   ├── queries/             // Query handlers
│   └── sagas/               // Complex workflows
├── infrastructure/
│   ├── adapters/            // External service adapters
│   ├── repositories/        // Data access implementations
│   └── anti-corruption/     // External system translation
└── presentation/
    ├── controllers/         // API endpoints
    └── dto/                 // Data transfer objects
```

### Domain Module Naming Conventions

```typescript
// ✅ Good - Domain module naming
@semantest/video.google.com/domain/aggregates/video.aggregate.ts
@semantest/pinterest.com/domain/aggregates/pin.aggregate.ts
@semantest/instagram.com/domain/aggregates/post.aggregate.ts
@semantest/unsplash.com/domain/aggregates/photo.aggregate.ts
@semantest/twitter.com/domain/aggregates/tweet.aggregate.ts

// ✅ Good - Value object naming
@semantest/video.google.com/domain/value-objects/video-id.value-object.ts
@semantest/pinterest.com/domain/value-objects/pin-url.value-object.ts

// ✅ Good - Event naming
@semantest/video.google.com/domain/events/video-created.event.ts
@semantest/pinterest.com/domain/events/pin-saved.event.ts

// ❌ Bad - Inconsistent naming
@semantest/video.google.com/domain/Video.ts
@semantest/pinterest.com/domain/PinAggregate.ts
```

## Aggregate Root Patterns

### Base Aggregate Pattern

```typescript
// ✅ Good - Aggregate root implementation
export abstract class AggregateRoot<T> {
  private _domainEvents: DomainEvent[] = [];
  private _id: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id?: string) {
    this._id = id || generateId();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  protected applyEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
    this._updatedAt = new Date();
  }

  getUncommittedEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  markEventsAsCommitted(): void {
    this._domainEvents = [];
  }

  getId(): string {
    return this._id;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  abstract equals(other: T): boolean;
}
```

### Domain-Specific Aggregate Examples

```typescript
// ✅ Good - Video aggregate with domain logic
export class Video extends AggregateRoot<Video> {
  private constructor(
    private readonly videoId: VideoId,
    private readonly url: VideoUrl,
    private metadata: VideoMetadata,
    private readonly platform: Platform,
    private chapters: VideoChapter[] = []
  ) {
    super(videoId.value);
  }

  static create(data: CreateVideoData): Result<Video, ValidationError> {
    const videoId = VideoId.create(data.id);
    const url = VideoUrl.create(data.url);
    const metadata = VideoMetadata.create(data.metadata);

    if (videoId.isFailure()) return Result.fail(videoId.getError());
    if (url.isFailure()) return Result.fail(url.getError());
    if (metadata.isFailure()) return Result.fail(metadata.getError());

    const video = new Video(
      videoId.getValue(),
      url.getValue(),
      metadata.getValue(),
      Platform.GoogleVideo
    );

    video.applyEvent(new VideoCreatedEvent(
      video.getId(),
      data.url,
      data.metadata.title,
      new Date()
    ));

    return Result.ok(video);
  }

  // Business method with domain logic
  addChapter(title: string, startTime: number, endTime: number): Result<void, DomainError> {
    // Validate chapter doesn't overlap
    if (this.chapters.some(chapter => chapter.overlaps(startTime, endTime))) {
      return Result.fail(new ChapterOverlapError(title, startTime, endTime));
    }

    const chapter = VideoChapter.create(title, startTime, endTime);
    if (chapter.isFailure()) {
      return Result.fail(chapter.getError());
    }

    this.chapters.push(chapter.getValue());
    this.applyEvent(new VideoChapterAddedEvent(
      this.getId(),
      title,
      startTime,
      endTime
    ));

    return Result.ok();
  }

  // Domain query methods
  getDurationInSeconds(): number {
    return this.metadata.duration.toSeconds();
  }

  getChapterCount(): number {
    return this.chapters.length;
  }

  // Required abstract method
  equals(other: Video): boolean {
    return this.videoId.equals(other.videoId);
  }
}
```

## Domain Event Conventions

### Event Naming Standards

```typescript
// ✅ Good - Domain event naming
export class VideoCreatedEvent extends DomainEvent {
  constructor(
    public readonly videoId: string,
    public readonly url: string,
    public readonly title: string,
    public readonly createdAt: Date,
    correlationId?: string
  ) {
    super('video.created', correlationId);
  }
}

export class PinSavedEvent extends DomainEvent {
  constructor(
    public readonly pinId: string,
    public readonly boardId: string,
    public readonly imageUrl: string,
    public readonly savedAt: Date,
    correlationId?: string
  ) {
    super('pin.saved', correlationId);
  }
}

// ❌ Bad - Inconsistent event naming
export class VideoEvent extends DomainEvent { } // Too generic
export class Video_Created extends DomainEvent { } // Wrong format
export class video_created_event extends DomainEvent { } // Wrong casing
```

### Event Structure Pattern

```typescript
// ✅ Good - Complete event structure
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly timestamp: Date;
  public readonly version: number;

  constructor(
    public readonly eventType: string,
    public readonly correlationId?: string,
    public readonly causationId?: string
  ) {
    this.eventId = generateId();
    this.timestamp = new Date();
    this.version = 1;
  }

  abstract toPrimitives(): Record<string, any>;
  abstract static fromPrimitives(data: Record<string, any>): DomainEvent;
}

// ✅ Good - Domain event implementation
export class PostPublishedEvent extends DomainEvent {
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
    public readonly content: string,
    public readonly publishedAt: Date,
    public readonly visibility: PostVisibility,
    correlationId?: string,
    causationId?: string
  ) {
    super('post.published', correlationId, causationId);
  }

  toPrimitives(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      timestamp: this.timestamp.toISOString(),
      version: this.version,
      postId: this.postId,
      authorId: this.authorId,
      content: this.content,
      publishedAt: this.publishedAt.toISOString(),
      visibility: this.visibility,
      correlationId: this.correlationId,
      causationId: this.causationId
    };
  }

  static fromPrimitives(data: Record<string, any>): PostPublishedEvent {
    return new PostPublishedEvent(
      data.postId,
      data.authorId,
      data.content,
      new Date(data.publishedAt),
      data.visibility,
      data.correlationId,
      data.causationId
    );
  }
}
```

## Value Object Standards

### Immutable Value Object Pattern

```typescript
// ✅ Good - Value object implementation
export abstract class ValueObject<T> {
  abstract equals(other: T): boolean;
  abstract hashCode(): number;
  abstract toString(): string;
}

export class VideoId extends ValueObject<VideoId> {
  private constructor(public readonly value: string) {
    super();
  }

  static create(value: string): Result<VideoId, ValidationError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new ValidationError('VideoId cannot be empty'));
    }

    // YouTube video ID validation
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!youtubeIdRegex.test(value)) {
      return Result.fail(new ValidationError('Invalid YouTube video ID format'));
    }

    return Result.ok(new VideoId(value));
  }

  static generate(): VideoId {
    return new VideoId(generateYouTubeId());
  }

  equals(other: VideoId): boolean {
    return this.value === other.value;
  }

  hashCode(): number {
    return this.value.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
  }

  toString(): string {
    return this.value;
  }
}

// ✅ Good - Complex value object
export class PinImage extends ValueObject<PinImage> {
  private constructor(
    public readonly url: string,
    public readonly width: number,
    public readonly height: number,
    public readonly altText: string,
    public readonly format: ImageFormat
  ) {
    super();
  }

  static create(data: CreatePinImageData): Result<PinImage, ValidationError> {
    // URL validation
    if (!isValidUrl(data.url)) {
      return Result.fail(new ValidationError('Invalid image URL'));
    }

    // Dimension validation
    if (data.width <= 0 || data.height <= 0) {
      return Result.fail(new ValidationError('Image dimensions must be positive'));
    }

    // Format validation
    if (!Object.values(ImageFormat).includes(data.format)) {
      return Result.fail(new ValidationError('Unsupported image format'));
    }

    return Result.ok(new PinImage(
      data.url,
      data.width,
      data.height,
      data.altText || '',
      data.format
    ));
  }

  getAspectRatio(): number {
    return this.width / this.height;
  }

  isSquare(): boolean {
    return this.width === this.height;
  }

  equals(other: PinImage): boolean {
    return this.url === other.url &&
           this.width === other.width &&
           this.height === other.height &&
           this.format === other.format;
  }

  hashCode(): number {
    return this.url.hashCode() ^ this.width ^ this.height ^ this.format.hashCode();
  }

  toString(): string {
    return `${this.url} (${this.width}x${this.height}, ${this.format})`;
  }
}
```

## Repository Pattern Guidelines

### Repository Interface Standards

```typescript
// ✅ Good - Repository interface
export interface IVideoRepository {
  findById(id: VideoId): Promise<Video | null>;
  findByChannelId(channelId: ChannelId): Promise<Video[]>;
  findByPlaylistId(playlistId: PlaylistId): Promise<Video[]>;
  save(video: Video): Promise<void>;
  saveAll(videos: Video[]): Promise<void>;
  delete(id: VideoId): Promise<void>;
  exists(id: VideoId): Promise<boolean>;
  count(): Promise<number>;
}

// ✅ Good - Generic repository pattern
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  saveAll(entities: T[]): Promise<void>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

// ✅ Good - Domain-specific repository
export interface IPinRepository extends IRepository<Pin, PinId> {
  findByBoardId(boardId: BoardId): Promise<Pin[]>;
  findByAuthorId(authorId: AuthorId): Promise<Pin[]>;
  findByImageUrl(imageUrl: string): Promise<Pin[]>;
  findPopularPins(limit: number): Promise<Pin[]>;
  searchByTags(tags: string[]): Promise<Pin[]>;
}
```

### Repository Implementation Standards

```typescript
// ✅ Good - Repository implementation
export class VideoRepository implements IVideoRepository {
  constructor(
    private readonly db: Database,
    private readonly mapper: VideoMapper,
    private readonly logger: Logger
  ) {}

  async findById(id: VideoId): Promise<Video | null> {
    try {
      const row = await this.db.query(
        'SELECT * FROM videos WHERE id = $1',
        [id.value]
      );

      if (!row) {
        return null;
      }

      return this.mapper.toDomain(row);
    } catch (error) {
      this.logger.error('Failed to find video by ID', { 
        videoId: id.value, 
        error: error.message 
      });
      throw new RepositoryError('Failed to find video', error as Error);
    }
  }

  async save(video: Video): Promise<void> {
    try {
      const data = this.mapper.toPersistence(video);
      
      await this.db.query(`
        INSERT INTO videos (id, url, title, description, duration, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          url = EXCLUDED.url,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          duration = EXCLUDED.duration,
          updated_at = EXCLUDED.updated_at
      `, [
        data.id,
        data.url,
        data.title,
        data.description,
        data.duration,
        data.createdAt,
        data.updatedAt
      ]);

      this.logger.info('Video saved successfully', { videoId: video.getId() });
    } catch (error) {
      this.logger.error('Failed to save video', { 
        videoId: video.getId(), 
        error: error.message 
      });
      throw new RepositoryError('Failed to save video', error as Error);
    }
  }

  async findByChannelId(channelId: ChannelId): Promise<Video[]> {
    try {
      const rows = await this.db.query(
        'SELECT * FROM videos WHERE channel_id = $1 ORDER BY created_at DESC',
        [channelId.value]
      );

      return rows.map(row => this.mapper.toDomain(row));
    } catch (error) {
      this.logger.error('Failed to find videos by channel ID', { 
        channelId: channelId.value, 
        error: error.message 
      });
      throw new RepositoryError('Failed to find videos by channel', error as Error);
    }
  }
}
```

## Integration Event Patterns

### Integration Event Structure

```typescript
// ✅ Good - Integration event base class
export abstract class IntegrationEvent {
  public readonly eventId: string;
  public readonly timestamp: Date;
  public readonly source: string;

  constructor(
    public readonly eventType: string,
    public readonly correlationId?: string
  ) {
    this.eventId = generateId();
    this.timestamp = new Date();
    this.source = 'semantest';
  }

  abstract toPrimitives(): Record<string, any>;
}

// ✅ Good - Cross-platform integration event
export class ContentExtractedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly contentId: string,
    public readonly platform: Platform,
    public readonly contentType: ContentType,
    public readonly url: string,
    public readonly metadata: ContentMetadata,
    correlationId?: string
  ) {
    super('content.extracted', correlationId);
  }

  toPrimitives(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      timestamp: this.timestamp.toISOString(),
      source: this.source,
      contentId: this.contentId,
      platform: this.platform,
      contentType: this.contentType,
      url: this.url,
      metadata: this.metadata,
      correlationId: this.correlationId
    };
  }

  static fromDomainEvent(domainEvent: DomainEvent): ContentExtractedIntegrationEvent {
    // Transform domain event to integration event
    if (domainEvent instanceof VideoCreatedEvent) {
      return new ContentExtractedIntegrationEvent(
        domainEvent.videoId,
        Platform.GoogleVideo,
        ContentType.Video,
        domainEvent.url,
        {
          title: domainEvent.title,
          extractedAt: domainEvent.createdAt
        },
        domainEvent.correlationId
      );
    }

    throw new UnsupportedEventTypeError(domainEvent.eventType);
  }
}
```

## Anti-Corruption Layer Standards

### ACL Implementation Pattern

```typescript
// ✅ Good - Anti-corruption layer
export class YouTubeApiAntiCorruptionLayer {
  constructor(
    private readonly youtubeClient: YouTubeApiClient,
    private readonly logger: Logger
  ) {}

  async getVideo(videoId: string): Promise<Result<Video, ExtractionError>> {
    try {
      // Call external API
      const apiResponse = await this.youtubeClient.getVideo(videoId);
      
      // Validate external response
      if (!this.isValidApiResponse(apiResponse)) {
        return Result.fail(new ExtractionError('Invalid API response'));
      }

      // Transform to domain model
      const video = this.transformToDomainModel(apiResponse);
      
      return Result.ok(video);
    } catch (error) {
      this.logger.error('YouTube API call failed', { 
        videoId, 
        error: error.message 
      });
      
      return Result.fail(new ExtractionError(
        'Failed to extract video from YouTube',
        error as Error
      ));
    }
  }

  private transformToDomainModel(apiData: YouTubeVideoResponse): Video {
    // Transform external API response to domain model
    const videoId = VideoId.create(apiData.id);
    const url = VideoUrl.create(`https://youtube.com/watch?v=${apiData.id}`);
    const metadata = VideoMetadata.create({
      title: apiData.snippet.title,
      description: apiData.snippet.description,
      duration: this.parseDuration(apiData.contentDetails.duration),
      publishedAt: new Date(apiData.snippet.publishedAt),
      thumbnails: this.transformThumbnails(apiData.snippet.thumbnails)
    });

    return Video.create({
      id: videoId.getValue(),
      url: url.getValue(),
      metadata: metadata.getValue(),
      platform: Platform.GoogleVideo
    }).getValue();
  }

  private isValidApiResponse(response: YouTubeVideoResponse): boolean {
    return response &&
           response.id &&
           response.snippet &&
           response.snippet.title &&
           response.contentDetails &&
           response.contentDetails.duration;
  }

  private parseDuration(isoDuration: string): Duration {
    // Parse ISO 8601 duration (PT4M13S) to domain Duration
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const match = isoDuration.match(regex);
    
    if (!match) {
      return Duration.zero();
    }

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return Duration.create(hours, minutes, seconds);
  }
}
```

## Error Handling Integration

### Domain Error Standards

```typescript
// ✅ Good - Domain error integration
export class VideoExtractionError extends DomainError {
  constructor(
    public readonly videoUrl: string,
    public readonly reason: string,
    originalError?: Error
  ) {
    super(
      `Failed to extract video from ${videoUrl}: ${reason}`,
      'VIDEO_EXTRACTION_ERROR',
      ErrorSeverity.High,
      { videoUrl, reason, originalError: originalError?.message }
    );
  }

  get userMessage(): string {
    return 'Unable to extract video information. Please check the URL and try again.';
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Automatic,
      actions: [
        'Retry with different extraction method',
        'Try alternative video URL',
        'Check if video is publicly available'
      ],
      retryable: true,
      maxRetries: 3,
      backoffMultiplier: 2
    };
  }
}

// ✅ Good - Platform-specific error
export class PinterestRateLimitError extends DomainError {
  constructor(
    public readonly requestsRemaining: number,
    public readonly resetTime: Date
  ) {
    super(
      `Pinterest API rate limit exceeded. ${requestsRemaining} requests remaining.`,
      'PINTEREST_RATE_LIMIT',
      ErrorSeverity.High,
      { requestsRemaining, resetTime: resetTime.toISOString() }
    );
  }

  get userMessage(): string {
    const waitTime = Math.ceil((this.resetTime.getTime() - Date.now()) / 60000);
    return `Pinterest is temporarily limiting requests. Please wait ${waitTime} minutes before trying again.`;
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Scheduled,
      actions: [
        'Queue request for later',
        'Notify user about rate limit',
        'Implement exponential backoff'
      ],
      retryable: true,
      retryAfter: this.resetTime
    };
  }
}
```

## Cross-Module Communication

### Module Boundary Standards

```typescript
// ✅ Good - Module boundary definition
export interface IVideoService {
  extractVideo(url: string): Promise<Result<Video, ExtractionError>>;
  getVideosByChannel(channelId: string): Promise<Result<Video[], NotFoundError>>;
  createPlaylist(name: string, videos: string[]): Promise<Result<Playlist, ValidationError>>;
}

// ✅ Good - Cross-module integration
export class CrossPlatformContentService {
  constructor(
    private readonly videoService: IVideoService,
    private readonly pinService: IPinService,
    private readonly postService: IPostService,
    private readonly eventBus: IEventBus
  ) {}

  async syncUserContent(userId: string, platforms: Platform[]): Promise<Result<SyncResult, SyncError>> {
    const results: PlatformSyncResult[] = [];

    for (const platform of platforms) {
      try {
        let syncResult: PlatformSyncResult;

        switch (platform) {
          case Platform.GoogleVideo:
            syncResult = await this.syncVideoContent(userId);
            break;
          case Platform.Pinterest:
            syncResult = await this.syncPinContent(userId);
            break;
          case Platform.Instagram:
            syncResult = await this.syncInstagramContent(userId);
            break;
          default:
            syncResult = { platform, success: false, error: 'Unsupported platform' };
        }

        results.push(syncResult);

        // Publish cross-platform event
        await this.eventBus.publish(new PlatformSyncCompletedEvent(
          userId,
          platform,
          syncResult.success,
          syncResult.contentCount || 0
        ));

      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error.message
        });
      }
    }

    return Result.ok({
      userId,
      platforms,
      results,
      totalSuccess: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    });
  }

  private async syncVideoContent(userId: string): Promise<PlatformSyncResult> {
    // Use video service to sync content
    const userVideos = await this.videoService.getVideosByChannel(userId);
    if (userVideos.isFailure()) {
      return {
        platform: Platform.GoogleVideo,
        success: false,
        error: userVideos.getError().message
      };
    }

    return {
      platform: Platform.GoogleVideo,
      success: true,
      contentCount: userVideos.getValue().length
    };
  }
}
```

## Testing Standards

### Domain Testing Patterns

```typescript
// ✅ Good - Domain aggregate testing
describe('Video Aggregate', () => {
  describe('create', () => {
    it('should create video with valid data', () => {
      // Arrange
      const videoData = {
        id: 'valid-video-id',
        url: 'https://youtube.com/watch?v=valid-id',
        metadata: {
          title: 'Test Video',
          description: 'Test description',
          duration: { hours: 0, minutes: 4, seconds: 30 }
        }
      };

      // Act
      const result = Video.create(videoData);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const video = result.getValue();
      expect(video.getId()).toBe('valid-video-id');
      expect(video.getTitle()).toBe('Test Video');

      // Verify domain event
      const events = video.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(VideoCreatedEvent);
      expect((events[0] as VideoCreatedEvent).videoId).toBe('valid-video-id');
    });

    it('should fail with invalid video ID', () => {
      // Arrange
      const videoData = {
        id: 'invalid-id', // Too short for YouTube
        url: 'https://youtube.com/watch?v=invalid-id',
        metadata: {
          title: 'Test Video',
          description: 'Test description',
          duration: { hours: 0, minutes: 4, seconds: 30 }
        }
      };

      // Act
      const result = Video.create(videoData);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(ValidationError);
      expect(result.getError().message).toContain('Invalid YouTube video ID format');
    });
  });

  describe('addChapter', () => {
    it('should add chapter successfully', () => {
      // Arrange
      const video = createValidVideo();
      const chapter = {
        title: 'Introduction',
        startTime: 0,
        endTime: 60
      };

      // Act
      const result = video.addChapter(chapter.title, chapter.startTime, chapter.endTime);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(video.getChapterCount()).toBe(1);

      // Verify domain event
      const events = video.getUncommittedEvents();
      const chapterEvent = events.find(e => e instanceof VideoChapterAddedEvent);
      expect(chapterEvent).toBeDefined();
      expect((chapterEvent as VideoChapterAddedEvent).title).toBe('Introduction');
    });

    it('should fail with overlapping chapters', () => {
      // Arrange
      const video = createValidVideo();
      video.addChapter('Chapter 1', 0, 60);

      // Act
      const result = video.addChapter('Chapter 2', 30, 90); // Overlaps with Chapter 1

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(ChapterOverlapError);
      expect(video.getChapterCount()).toBe(1); // Should still be 1
    });
  });
});

// ✅ Good - Integration testing
describe('Video Service Integration', () => {
  let videoService: VideoService;
  let mockRepository: MockVideoRepository;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockRepository = new MockVideoRepository();
    mockEventBus = new MockEventBus();
    videoService = new VideoService(mockRepository, mockEventBus);
  });

  describe('extractVideo', () => {
    it('should extract video and publish event', async () => {
      // Arrange
      const videoUrl = 'https://youtube.com/watch?v=test-id';
      const expectedVideo = createValidVideo();
      mockRepository.mockSave.mockResolvedValue();

      // Act
      const result = await videoService.extractVideo(videoUrl);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Video));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'video.extracted'
        })
      );
    });

    it('should handle extraction errors gracefully', async () => {
      // Arrange
      const invalidUrl = 'https://invalid-url.com';

      // Act
      const result = await videoService.extractVideo(invalidUrl);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(VideoExtractionError);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
```

## Performance Standards

### Optimization Patterns

```typescript
// ✅ Good - Performance-optimized repository
export class OptimizedVideoRepository implements IVideoRepository {
  private cache = new Map<string, Video>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly db: Database,
    private readonly mapper: VideoMapper,
    private readonly logger: Logger
  ) {}

  async findById(id: VideoId): Promise<Video | null> {
    // Check cache first
    const cached = this.cache.get(id.value);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // Query database
    const video = await this.queryDatabase(id);
    
    // Cache result
    if (video) {
      this.cache.set(id.value, video);
    }

    return video;
  }

  async findByChannelId(channelId: ChannelId): Promise<Video[]> {
    // Use database query with proper indexing
    const videos = await this.db.query(`
      SELECT * FROM videos 
      WHERE channel_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `, [channelId.value]);

    return videos.map(row => this.mapper.toDomain(row));
  }

  private isCacheValid(video: Video): boolean {
    const now = Date.now();
    const videoAge = now - video.getUpdatedAt().getTime();
    return videoAge < this.cacheTimeout;
  }

  private async queryDatabase(id: VideoId): Promise<Video | null> {
    const startTime = Date.now();
    
    try {
      const row = await this.db.query(
        'SELECT * FROM videos WHERE id = $1',
        [id.value]
      );

      const duration = Date.now() - startTime;
      this.logger.info('Database query completed', { 
        videoId: id.value, 
        duration,
        found: !!row 
      });

      return row ? this.mapper.toDomain(row) : null;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Database query failed', { 
        videoId: id.value, 
        duration,
        error: error.message 
      });
      throw error;
    }
  }
}
```

## Summary

This enhanced TypeScript style guide provides comprehensive standards for:

1. **Domain Module Organization** - Consistent structure across all platforms
2. **Aggregate Root Patterns** - Rich domain models with business logic
3. **Event-Driven Architecture** - Standardized event handling and integration
4. **Value Object Design** - Immutable, validated data structures
5. **Repository Patterns** - Consistent data access abstractions
6. **Anti-Corruption Layers** - Clean external system integration
7. **Error Handling** - Comprehensive error management
8. **Testing Standards** - Domain-driven testing approaches
9. **Performance Optimization** - Efficient implementation patterns

These standards ensure consistency, maintainability, and quality across all domain modules while supporting the architectural patterns established in the domain expansion design.