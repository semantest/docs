import { AggregateRoot } from '../../../../core/src/entities';
import { TweetId } from '../value-objects/TweetId';
import { UserId } from '../value-objects/UserId';
import { EngagementTracked } from '../events/EngagementTracked';
import { EngagementAnalyzed } from '../events/EngagementAnalyzed';

export interface EngagementMetrics {
  impressions: number;
  engagements: number;
  engagementRate: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  profileClicks: number;
  urlClicks: number;
  hashtagClicks: number;
  detailExpands: number;
  mediaViews: number;
  mediaEngagements: number;
}

export interface EngagementProps {
  tweetId: TweetId;
  authorId: UserId;
  metrics: EngagementMetrics;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  analyzedAt?: Date;
}

export class Engagement extends AggregateRoot {
  private constructor(
    private readonly tweetId: TweetId,
    private readonly authorId: UserId,
    private props: EngagementProps,
    private insights: string[] = []
  ) {
    super();
  }

  static create(
    tweetId: TweetId,
    authorId: UserId,
    props: EngagementProps
  ): Engagement {
    const engagement = new Engagement(tweetId, authorId, props);
    engagement.addDomainEvent(
      new EngagementTracked(tweetId, authorId, props.metrics, new Date())
    );
    return engagement;
  }

  updateMetrics(metrics: Partial<EngagementMetrics>): void {
    this.props.metrics = { ...this.props.metrics, ...metrics };
    
    // Recalculate engagement rate
    if (this.props.metrics.impressions > 0) {
      this.props.metrics.engagementRate = 
        this.props.metrics.engagements / this.props.metrics.impressions;
    }
  }

  analyze(): void {
    this.props.analyzedAt = new Date();
    
    // Generate insights based on metrics
    const insights = this.generateInsights();
    this.insights = insights;
    
    this.addDomainEvent(
      new EngagementAnalyzed(
        this.tweetId,
        this.authorId,
        this.props.metrics,
        insights,
        this.props.analyzedAt
      )
    );
  }

  private generateInsights(): string[] {
    const insights: string[] = [];
    const { metrics } = this.props;
    
    if (metrics.engagementRate > 0.05) {
      insights.push('High engagement rate - content resonates well with audience');
    }
    
    if (metrics.retweets > metrics.likes * 0.3) {
      insights.push('High retweet ratio - content is highly shareable');
    }
    
    if (metrics.replies > metrics.likes * 0.2) {
      insights.push('High reply ratio - content sparks conversation');
    }
    
    if (metrics.urlClicks > 0 && metrics.urlClicks / metrics.impressions > 0.02) {
      insights.push('Strong click-through rate on links');
    }
    
    if (metrics.mediaViews > 0 && metrics.mediaEngagements / metrics.mediaViews > 0.1) {
      insights.push('Media content performs well');
    }
    
    if (metrics.profileClicks > metrics.impressions * 0.01) {
      insights.push('Content drives profile visits');
    }
    
    return insights;
  }

  addCustomInsight(insight: string): void {
    if (!this.insights.includes(insight)) {
      this.insights.push(insight);
    }
  }

  removeInsight(insight: string): void {
    this.insights = this.insights.filter(i => i !== insight);
  }

  isAnalyzed(): boolean {
    return !!this.props.analyzedAt;
  }

  getTweetId(): TweetId {
    return this.tweetId;
  }

  getAuthorId(): UserId {
    return this.authorId;
  }

  getMetrics(): EngagementMetrics {
    return { ...this.props.metrics };
  }

  getPeriod(): 'hour' | 'day' | 'week' | 'month' {
    return this.props.period;
  }

  getStartDate(): Date {
    return this.props.startDate;
  }

  getEndDate(): Date {
    return this.props.endDate;
  }

  getAnalyzedAt(): Date | undefined {
    return this.props.analyzedAt;
  }

  getInsights(): string[] {
    return [...this.insights];
  }

  getEngagementRate(): number {
    return this.props.metrics.engagementRate;
  }

  getTotalEngagements(): number {
    return this.props.metrics.engagements;
  }

  getImpressions(): number {
    return this.props.metrics.impressions;
  }

  protected apply(event: any): void {
    // Event sourcing implementation
  }
}