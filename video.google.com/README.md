# Video.Google.com Domain Module

YouTube video downloading and management domain module for Semantest.

## Domain Model

### Entities
- **Video**: Represents a YouTube video with download capabilities
- **Channel**: Represents a YouTube channel 
- **Playlist**: Represents a YouTube playlist

### Value Objects
- **VideoId**: YouTube video identifier
- **VideoMetadata**: Video information (title, description, duration, etc.)
- **VideoQuality**: Video quality settings (144p, 360p, 720p, 1080p, 4K)
- **ChannelId**: YouTube channel identifier
- **PlaylistId**: YouTube playlist identifier

### Events
- **VideoDownloadRequested**: Triggered when a video download is requested
- **VideoDownloadCompleted**: Triggered when a video download is completed
- **PlaylistSynced**: Triggered when a playlist is synchronized

## Architecture

This module follows Domain-Driven Design (DDD) principles:

```
video.google.com/
├── domain/
│   ├── entities/       # Core business entities
│   ├── events/         # Domain events
│   └── value-objects/  # Value objects
├── application/        # Application services
├── infrastructure/     # External adapters
└── tests/             # Unit tests
```

## Usage

```typescript
import { VideoDownloadService } from '@semantest/video.google.com';

const service = new VideoDownloadService(youtubeApi, repository, eventPublisher);
const video = await service.downloadVideo(videoId, VideoQuality.fullHd());
```