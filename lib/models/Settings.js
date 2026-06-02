import mongoose from 'mongoose';

// Generic key-value store for app-level settings (Google tokens, calendar ID, etc.)
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
