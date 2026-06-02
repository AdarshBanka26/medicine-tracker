import mongoose from 'mongoose';
import Schedule from './models/Schedule';
import AdherenceLog from './models/AdherenceLog';

// Seeds today's pending log entries for all active schedules belonging to userId.
// Safe to call multiple times — upsert logic prevents duplicates.
export async function seedTodayLogs(userId) {
  if (!userId) return;

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const userOid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  const schedules = await Schedule.find({ userId: userOid, isActive: true });

  for (const schedule of schedules) {
    for (const time of schedule.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      try {
        await AdherenceLog.updateOne(
          { userId: userOid, scheduleId: schedule._id, date: dateStr, scheduledTime },
          {
            $setOnInsert: {
              userId: userOid,
              scheduleId: schedule._id,
              elixirName: schedule.elixirName,
              dosage: schedule.dosage,
              scheduledTime,
              date: dateStr,
              status: 'pending',
              takenAt: null,
            },
          },
          { upsert: true }
        );
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
  }
}
