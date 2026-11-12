package com.haqqallah.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class HaqqAllahAppWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private var nextPrayer = "صلاة الفجر"
        private var countdown = "٤:٠٧:٢٤"
        private var hijri = "29 جمادى الأولى 1448 هـ"
        private var city = "ميت غمر"

        fun updateWidgetData(
            context: Context,
            nextPrayerName: String,
            countdownText: String,
            hijriDate: String,
            cityName: String
        ) {
            nextPrayer = nextPrayerName
            countdown = countdownText
            hijri = hijriDate
            city = cityName

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, HaqqAllahAppWidget::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)

            for (widgetId in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, widgetId)
            }
        }

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_haqq_allah)

            // Bind live data
            views.setTextViewText(R.id.tv_hijri_date, hijri)
            views.setTextViewText(R.id.tv_city_name, city)
            views.setTextViewText(R.id.tv_next_prayer_name, nextPrayer)
            views.setTextViewText(R.id.tv_countdown_timer, countdown)

            // Main widget click intent -> Open Main Activity
            val mainIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            val mainPendingIntent = PendingIntent.getActivity(
                context,
                0,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, mainPendingIntent)

            // Azkar Shortcut Button intent -> Open Azkar Screen directly
            val azkarIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra("EXTRA_TARGET_SCREEN", "AZKAR")
            }
            val azkarPendingIntent = PendingIntent.getActivity(
                context,
                101,
                azkarIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_widget_azkar, azkarPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
