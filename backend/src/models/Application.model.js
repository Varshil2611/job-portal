import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },

    // Resume used for this specific application (may differ from profile resume)
    resume: {
      url: { type: String, required: [true, 'Resume is required'] },
      publicId: String,
      originalName: String,
    },

    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },

    // Employer's internal note about this applicant (not visible to candidate)
    employerNote: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      select: false, // Hidden from candidate queries
    },

    // Track status change timestamps for analytics
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Compound index: prevent duplicate applications ───────────────────────────
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });

// ─── Post-save: increment job's applicationCount ──────────────────────────────
applicationSchema.post('save', async function (doc) {
  if (this.isNew) {
    await mongoose.model('Job').findByIdAndUpdate(doc.job, {
      $inc: { applicationCount: 1 },
    });
  }
});

// ─── Pre-remove: decrement job's applicationCount ────────────────────────────
applicationSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await mongoose.model('Job').findByIdAndUpdate(doc.job, {
      $inc: { applicationCount: -1 },
    });
  }
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;