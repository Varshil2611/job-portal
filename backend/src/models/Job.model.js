import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    requirements: {
      type: String,
      maxlength: [3000, 'Requirements cannot exceed 3000 characters'],
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    company: {
      name: { type: String, required: [true, 'Company name is required'], trim: true },
      logo: String,
      website: String,
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['full-time', 'part-time', 'remote', 'hybrid', 'contract', 'internship'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Technology',
        'Marketing',
        'Finance',
        'Healthcare',
        'Education',
        'Design',
        'Sales',
        'Operations',
        'HR',
        'Other',
      ],
    },

    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
    },

    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: false },
    },

    skillsRequired: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: [(arr) => arr.length > 0, 'At least one skill is required'],
    },

    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: 'Deadline must be a future date',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    applicationCount: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for fast search ──────────────────────────────────────────────────
jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ deadline: 1 });

// ─── Virtual: Check if job is expired ────────────────────────────────────────
jobSchema.virtual('isExpired').get(function () {
  return this.deadline < new Date();
});

// Ensure virtuals show in JSON responses
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

// ─── Pre-find hook: auto-expire jobs past deadline ────────────────────────────
jobSchema.pre(/^find/, function (next) {
  this.where({ deadline: { $gte: new Date() } }).where({ isActive: true });
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;