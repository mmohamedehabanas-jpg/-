package com.haqqallah.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager

class AthanAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        if (action == Intent.ACTION_BOOT_COMPLETED || action == Intent.ACTION_MY_PACKAGE_REPLACED || action == Intent.ACTION_TIMEZONE_CHANGED) {
            // Re-calculate and reschedule alarms on device boot or time change
            rescheduleAllAlarms(context)
            return
        }

        val prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "الفجر"

        // Acquire temporary high-priority wake lock to guarantee execution in deep doze
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "HaqqAllah::AthanAlarmReceiverWakeLock"
        )
        wakeLock.acquire(60 * 1000L) // 60 seconds

        // Start Foreground Service to play Athan and show full screen lock overlay
        val serviceIntent = Intent(context, AthanForegroundService::class.java).apply {
            this.action = AthanForegroundService.ACTION_START_ATHAN
            putExtra(AthanForegroundService.EXTRA_PRAYER_NAME, prayerName)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }

        wakeLock.release()
    }

    companion object {
        const val ACTION_PRAYER_ALARM = "com.haqqallah.app.ACTION_PRAYER_ALARM"
        const val EXTRA_PRAYER_NAME = "EXTRA_PRAYER_NAME"

        /**
         * Schedules an exact alarm that fires even in Deep Doze Mode using setExactAndAllowWhileIdle
         */
        fun scheduleExactAlarm(context: Context, prayerName: String, triggerTimeMillis: Long) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val intent = Intent(context, AthanAlarmReceiver::class.java).apply {
                action = ACTION_PRAYER_ALARM
                putExtra(EXTRA_PRAYER_NAME, prayerName)
            }

            val requestCode = prayerName.hashCode()
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Can use exact alarms check on Android 12+ (S)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerTimeMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerTimeMillis,
                        pendingIntent
                    )
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimeMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimeMillis,
                    pendingIntent
                )
            }
        }

        fun rescheduleAllAlarms(context: Context) {
            // Trigger background calculation and rescheduling
            val refreshIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(refreshIntent)
        }
    }
}
