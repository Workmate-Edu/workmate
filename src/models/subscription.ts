import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  status: "active" | "inactive" | "expired" | "paused" | "cancelled" | "completed";
  plan: string;
  startDate: Date;
  endDate: Date;
  lastPayment: Date;
  children?: mongoose.Types.ObjectId[];
  // Each subject entry now supports per-subscription period
  subjects?: Array<{
    subject: string;
    childId?: mongoose.Types.ObjectId | string; // undefined or userId for parent/self/independent
    startDate?: Date; // per-subject period
    endDate?: Date;   // per-subject period
    // ...other subject-specific fields...
  }>;

  payment?: {
    amount: number;
    currency: string;
    interval: string;
    status: "active" | "past_due" | "cancelled" | "completed";
    history: {
      paymentId: mongoose.Types.ObjectId;
      date: Date;
      amount: number;
    }[];
  };

  learningPath?: {
    initialAssessmentId?: mongoose.Types.ObjectId;
    goals: {
      subject: string;
      initialLevel: string;
      targetLevel: string;
      progress: {
        currentLevel: string;
        milestones: {
          description: string;
          achievedAt: Date;
          verified: boolean;
        }[];
        completionPercentage: number;
      };
      status: "in_progress" | "achieved" | "revised";
    }[];
    monthlyReviews: {
      date: Date;
      progressSummary: string;
      adjustments: {
        goal: string;
        reason: string;
        newTarget: string;
      }[];
      nextSteps: string[];
    }[];
  };

  sessions?: {
    frequency: {
      perWeek: number;
      flexible: boolean;
      preferredDays: {
        day: string;
        slots: string[];
      }[];
    };
    upcoming: {
      sessionId: mongoose.Types.ObjectId;
      date: Date;
      goals: string[];
    }[];
    completed: {
      count: number;
      lastSession: Date;
    };
  };
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "paused", "cancelled", "completed"],
      default: "inactive",
    },
    plan: { type: String, default: "weekly" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    lastPayment: { type: Date, required: true },
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // Update: subjects array supports per-subject start/end dates
    subjects: [{
      subject: { type: String, required: true },
      childId: { type: Schema.Types.ObjectId, ref: "User" }, // undefined or userId for parent/self/independent
      startDate: { type: Date }, // per-subject
      endDate: { type: Date },   // per-subject
      // ...other subject-specific fields...
    }],

    payment: {
      amount: Number,
      currency: { type: String, default: "NGN" },
      interval: String,
      status: {
        type: String,
        enum: ["active", "past_due", "cancelled", "completed"],
        default: "active",
      },
      history: [
        {
          paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
          date: Date,
          amount: Number,
          _id: false,
        },
      ],
    },

    learningPath: {
      initialAssessmentId: { type: Schema.Types.ObjectId, ref: "InitialAssessment" },
      goals: [
        {
          subject: String,
          initialLevel: String,
          targetLevel: String,
          progress: {
            currentLevel: String,
            milestones: [
              {
                description: String,
                achievedAt: Date,
                verified: Boolean,
                _id: false,
              },
            ],
            completionPercentage: Number,
          },
          status: {
            type: String,
            enum: ["in_progress", "achieved", "revised"],
            default: "in_progress",
          },
          _id: false,
        },
      ],
      monthlyReviews: [
        {
          date: Date,
          progressSummary: String,
          adjustments: [
            {
              goal: String,
              reason: String,
              newTarget: String,
              _id: false,
            },
          ],
          nextSteps: [String],
          _id: false,
        },
      ],
    },

    sessions: {
      frequency: {
        perWeek: Number,
        flexible: Boolean,
        preferredDays: [
          {
            day: String,
            slots: [String],
            _id: false,
          },
        ],
        _id: false,
      },
      upcoming: [
        {
          sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
          date: Date,
          goals: [String],
          _id: false,
        },
      ],
      completed: {
        count: { type: Number, default: 0 },
        lastSession: Date,
        _id: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ "payment.status": 1 });
subscriptionSchema.index({ "learningPath.initialAssessmentId": 1 });
subscriptionSchema.index({ "learningPath.goals.status": 1 });

export const Subscription =
  models.Subscription || model<ISubscription>("Subscription", subscriptionSchema);
