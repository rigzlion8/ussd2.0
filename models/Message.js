import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^254[0-9]{9}$/.test(v);
      },
      message: 'Invalid Kenyan phone number format'
    }
  },
  content: {
    type: String,
    required: true,
    maxlength: 160 // SMS character limit
  },
  type: {
    type: String,
    required: true,
    enum: ['love', 'bible', 'welcome', 'cancellation', 'payment'],
    index: true
  },
  channel: {
    type: String,
    required: true,
    enum: ['sms', 'ussd'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'failed', 'expired'],
    default: 'pending',
    index: true
  },
  africastalkingId: {
    type: String,
    index: true
  },
  cost: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  deliveryReport: {
    status: String,
    errorCode: String,
    errorMessage: String,
    deliveredAt: Date,
    receivedAt: Date
  },
  metadata: {
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote'
    },
    subscriptionId: String,
    campaignId: String,
    retryCount: {
      type: Number,
      default: 0
    }
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
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
MessageSchema.index({ recipient: 1, createdAt: -1 });
MessageSchema.index({ status: 1, createdAt: -1 });
MessageSchema.index({ type: 1, status: 1 });
MessageSchema.index({ channel: 1, status: 1 });
MessageSchema.index({ africastalkingId: 1 });
MessageSchema.index({ createdAt: -1 });

// Method to update delivery status
MessageSchema.methods.updateDeliveryStatus = function(status, errorCode = null, errorMessage = null) {
  this.status = status;
  this.deliveryReport.status = status;
  this.deliveryReport.errorCode = errorCode;
  this.deliveryReport.errorMessage = errorMessage;
  
  if (status === 'delivered') {
    this.deliveredAt = new Date();
    this.deliveryReport.deliveredAt = new Date();
  }
  
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get delivery statistics
MessageSchema.statics.getDeliveryStats = async function(startDate, endDate) {
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
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get messages by type
MessageSchema.statics.getMessagesByType = async function(type, startDate, endDate, limit = 100) {
  return await this.find({
    type,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('metadata.quoteId');
};

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
