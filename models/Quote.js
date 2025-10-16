import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['love', 'bible']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    enum: ['en', 'sw'],
    default: 'en'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
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
QuoteSchema.index({ type: 1 });
QuoteSchema.index({ language: 1 });
QuoteSchema.index({ isActive: 1 });
QuoteSchema.index({ priority: -1 });
QuoteSchema.index({ usageCount: 1 });
QuoteSchema.index({ createdAt: -1 });

// Method to increment usage count
QuoteSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Static method to get random quote
QuoteSchema.statics.getRandomQuote = async function(type, language = 'en') {
  const quotes = await this.find({
    type,
    language,
    isActive: true
  }).sort({ priority: -1, usageCount: 1 });

  if (quotes.length === 0) {
    return null;
  }

  // Weighted random selection (higher priority quotes have better chance)
  const weightedQuotes = [];
  quotes.forEach(quote => {
    const weight = Math.max(1, 11 - quote.usageCount) * quote.priority;
    for (let i = 0; i < weight; i++) {
      weightedQuotes.push(quote);
    }
  });

  const randomIndex = Math.floor(Math.random() * weightedQuotes.length);
  return weightedQuotes[randomIndex];
};

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
