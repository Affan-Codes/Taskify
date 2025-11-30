import { Store } from "express-rate-limit";
import mongoose from "mongoose";

interface RateLimitDocument {
  key: string;
  value: number;
  resetTime: Date;
}

const rateLimitSchema = new mongoose.Schema<RateLimitDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      default: 1,
    },
    resetTime: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index - MongoDB automatically deletes expired documents
rateLimitSchema.index({ resetTime: 1 }, { expireAfterSeconds: 0 });

const RateLimitModel = mongoose.model<RateLimitDocument>(
  "RateLimit",
  rateLimitSchema
);

/**
 * Custom MongoDB store for express-rate-limit
 * Production-ready with proper error handling and TypeScript support
 */

export class MongoRateLimitStore implements Store {
  windowMs: number;
  prefix?: string;

  constructor(options: { windowMs: number; prefix?: string }) {
    this.windowMs = options.windowMs;
    this.prefix = options.prefix || "rl:";
  }

  /**
   * Generate full key with prefix
   */

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Increment counter for a key (called on each request)
   * Returns total hits and reset time
   */

  async increment(
    key: string
  ): Promise<{ totalHits: number; resetTime: Date }> {
    const dbKey = this.getKey(key);
    const resetTime = new Date(Date.now() + this.windowMs);

    try {
      // Atomic operation: increment value or create new document

      const result = await RateLimitModel.findOneAndUpdate(
        { key: dbKey },
        { $inc: { value: 1 }, $setOnInsert: { resetTime } },
        {
          upsert: true, // Create if doesn't exist
          new: true, // Return updated document
          setDefaultsOnInsert: true,
        }
      );

      if (!result) {
        throw new Error("Failed to increment rate limit");
      }

      return {
        totalHits: result.value,
        resetTime: result.resetTime,
      };
    } catch (error) {
      console.error("Rate limit increment error:", error);
      // Don't throw - fail open (allow request) rather than fail closed
      return {
        totalHits: 1,
        resetTime,
      };
    }
  }

  /**
   * Decrement counter for a key (called when request is successful and skipSuccessfulRequests is true)
   */
  async decrement(key: string): Promise<void> {
    const dbKey = this.getKey(key);

    try {
      await RateLimitModel.findOneAndUpdate(
        { key: dbKey },
        { $inc: { value: -1 } }
      );
    } catch (error) {
      console.error("Rate limit decrement error:", error);
      // Fail silently - decrement is not critical
    }
  }

  /**
   * Reset counter for a specific key
   */
  async resetKey(key: string): Promise<void> {
    const dbKey = this.getKey(key);

    try {
      await RateLimitModel.deleteOne({ key: dbKey });
    } catch (error) {
      console.error("Rate limit reset error:", error);
    }
  }

  /**
   * Reset all counters (admin function, rarely used)
   */
  async resetAll(): Promise<void> {
    try {
      await RateLimitModel.deleteMany({ key: new RegExp(`^${this.prefix}`) });
    } catch (error) {
      console.error("Rate limit reset all error:", error);
    }
  }

  /**
   * Initialize store - create indexes
   * Called once when rate limiter is set up
   */
  init(): void {
    RateLimitModel.createIndexes()
      .then(() => {
        console.log(`✅ Rate limit indexes created for prefix: ${this.prefix}`);
      })
      .catch((error) => {
        console.error("Failed to create rate limit indexes:", error);
      });
  }
}
