import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  elixirName: { type: String, required: true, trim: true },
  dosage:     { type: String, required: true, trim: true },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'twice-daily', 'thrice-daily', 'weekly', 'as-needed'],
  },
  times:     [{ type: String }],
  notes:     { type: String, trim: true },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
