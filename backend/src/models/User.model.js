import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },

    role: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      default: 'candidate',
    },

    // ── Candidate-specific fields ────────────────────────────────────────────
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: String,
      enum: ['fresher', '1-2 years', '2-5 years', '5+ years'],
    },

    location: {
      type: String,
      trim: true,
    },

    resume: {
      url: String,
      publicId: String,
      originalName: String,
    },

    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],

    // ── Employer-specific fields ─────────────────────────────────────────────
    company: {
      name: { type: String, trim: true },
      website: { type: String, trim: true },
      description: { type: String, maxlength: [1000, 'Description too long'] },
      logo: {
        url: String,
        publicId: String,
      },
      industry: { type: String, trim: true },
      size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ─── Pre-save Hook: Hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000; // ensure JWT issued after change
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isEmployer = function () {
  return this.role === 'employer';
};

userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

export default User;