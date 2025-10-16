import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^254[0-9]{9}$/.test(v);
      },
      message: 'Invalid Kenyan phone number format'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['love', 'bible']
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  cost: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  africastalkingSubscriptionId: {
    type: String
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'refunded'],
      required: true
    },
    africastalkingTransactionId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    failureReason: String
  }],
  totalPaid: {
    type: Number,
    default: 0
  },
  totalFailed: {
    type: Number,
    default: 0
  },
  consecutiveFailures: {
    type: Number,
    default: 0
  },
  maxConsecutiveFailures: {
    type: Number,
    default: 3
  },
  isAutoRenew: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
SubscriptionSchema.index({ userId: 1, type: 1 });
SubscriptionSchema.index({ status: 1, nextBillingDate: 1 });
SubscriptionSchema.index({ africastalkingSubscriptionId: 1 });
SubscriptionSchema.index({ createdAt: -1 });

// Method to add payment record
SubscriptionSchema.methods.addPayment = function(amount, status, africastalkingTransactionId = null, failureReason = null) {
  this.paymentHistory.push({
    amount,
    status,
    africastalkingTransactionId,
    failureReason
  });

  if (status === 'successful') {
    this.totalPaid += amount;
    this.consecutiveFailures = 0;
  } else if (status === 'failed') {
    this.totalFailed += amount;
    this.consecutiveFailures += 1;
  }

  this.updatedAt = new Date();
  return this.save();
};

// Method to extend subscription
SubscriptionSchema.methods.extend = function(periods = 1) {
  const extensionDays = this.billingCycle === 'daily' ? periods : periods * 7;
  this.endDate = new Date(this.endDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
  this.nextBillingDate = new Date(this.nextBillingDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
  this.updatedAt = new Date();
  return this.save();
};

// Method to cancel subscription
SubscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.isAutoRenew = false;
  this.updatedAt = new Date();
  return this.save();
};

// Method to pause subscription
SubscriptionSchema.methods.pause = function() {
  this.status = 'paused';
  this.updatedAt = new Date();
  return this.save();
};

// Method to resume subscription
SubscriptionSchema.methods.resume = function() {
  this.status = 'active';
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get active subscriptions for billing
SubscriptionSchema.statics.getSubscriptionsForBilling = async function() {
  const now = new Date();
  return await this.find({
    status: 'active',
    isAutoRenew: true,
    nextBillingDate: { $lte: now }
  }).populate('userId');
};

// Static method to get subscription statistics
SubscriptionSchema.statics.getSubscriptionStats = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPaid' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
