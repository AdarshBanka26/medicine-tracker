import mongoose from 'mongoose';

const AdherenceLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scheduleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  elixirName:   { type: String, required: true },
  dosage:       { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  date:         { type: String, required: true }, // "YYYY-MM-DD"
  status:       { type: String, enum: ['pending', 'taken', 'missed'], default: 'pending' },
  takenAt:      { type: Date, default: null },
  calendarEventId: { type: String, default: null },
});

// Scoped unique index — one log per user+schedule+time combination
AdherenceLogSchema.index(
  { userId: 1, scheduleId: 1, date: 1, scheduledTime: 1 },
  { unique: true }
);

export default mongoose.models.AdherenceLog ||
  mongoose.model('AdherenceLog', AdherenceLogSchema);
