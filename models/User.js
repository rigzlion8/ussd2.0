import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Kenyan phone number validation (254XXXXXXXXX)
        return /^254[0-9]{9}$/.test(v);
      },
      message: 'Invalid Kenyan phone number format'
    }
  },
  name: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'sw'],
      default: 'en'
    },
    deliveryTime: {
      type: String,
      default: '09:00' // Default 9 AM
    }
  },
  subscriptionHistory: [{
    type: {
      type: String,
      enum: ['love', 'bible'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    billingCycle: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily'
    }
  }],
  totalSpent: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
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

// Index for efficient queries
UserSchema.index({ 'subscriptionHistory.isActive': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for current active subscriptions
UserSchema.virtual('activeSubscriptions').get(function() {
  return this.subscriptionHistory.filter(sub => 
    sub.isActive && new Date() <= sub.endDate
  );
});

// Method to add subscription
UserSchema.methods.addSubscription = function(type, billingCycle = 'daily') {
  const now = new Date();
  const endDate = new Date();
  
  if (billingCycle === 'daily') {
    endDate.setDate(now.getDate() + 1);
  } else {
    endDate.setDate(now.getDate() + 7);
  }

  // Deactivate existing subscriptions of the same type
  this.subscriptionHistory.forEach(sub => {
    if (sub.type === type && sub.isActive) {
      sub.isActive = false;
    }
  });

  // Add new subscription
  this.subscriptionHistory.push({
    type,
    startDate: now,
    endDate,
    isActive: true,
    billingCycle
  });

  this.lastActivity = now;
  return this.save();
};

// Method to cancel subscription
UserSchema.methods.cancelSubscription = function(type) {
  this.subscriptionHistory.forEach(sub => {
    if (sub.type === type && sub.isActive) {
      sub.isActive = false;
    }
  });
  this.lastActivity = new Date();
  return this.save();
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
