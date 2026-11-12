package com.haqqallah.app.compose

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Distinctive Palette for Haqq Allah Enterprise Compose Theme
val IslamicEmeraldDark = Color(0xFF061914)
val IslamicEmeraldCard = Color(0xFF0C3127)
val IslamicGold = Color(0xFFFBBF24)
val IslamicMint = Color(0xFF6EE7B7)
val IslamicTextWhite = Color(0xFFF8FAFC)

/**
 * 1. Reactive Prayer Countdown Card in Jetpack Compose
 */
@Composable
fun PrayerCountdownComposeCard(
    nextPrayerName: String,
    countdownFormatted: String,
    progressFraction: Float,
    hijriDateFormatted: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(12.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = IslamicEmeraldCard),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, IslamicGold.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Hijri Date Header
            Text(
                text = hijriDateFormatted,
                color = IslamicMint,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Circular Countdown Arc
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(160.dp)
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    // Background track
                    drawCircle(
                        color = Color.Black.copy(alpha = 0.35f),
                        style = Stroke(width = 12.dp.toPx(), cap = StrokeCap.Round)
                    )
                    // Progress arc
                    drawArc(
                        brush = Brush.sweepGradient(listOf(IslamicGold, IslamicMint, IslamicGold)),
                        startAngle = -90f,
                        sweepAngle = 360f * progressFraction,
                        useCenter = false,
                        style = Stroke(width = 12.dp.toPx(), cap = StrokeCap.Round)
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "الصلاة القادمة",
                        color = IslamicTextWhite.copy(alpha = 0.7f),
                        fontSize = 12.sp
                    )
                    Text(
                        text = nextPrayerName,
                        color = IslamicGold,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = countdownFormatted,
                        color = IslamicTextWhite,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

/**
 * 2. Animated Qibla Compass Needle in Jetpack Compose
 */
@Composable
fun QiblaCompassComposeView(
    compassHeading: Float,
    qiblaBearing: Float,
    modifier: Modifier = Modifier
) {
    val animatedRotation by animateFloatAsState(
        targetValue = qiblaBearing - compassHeading,
        animationSpec = spring(stiffness = Spring.StiffnessLow),
        label = "QiblaNeedleRotation"
    )

    Box(
        modifier = modifier
            .size(220.dp)
            .clip(CircleShape)
            .background(IslamicEmeraldDark)
            .border(2.dp, IslamicGold.copy(alpha = 0.6f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            // Compass dial markings
            for (i in 0 until 360 step 30) {
                val isMajor = i % 90 == 0
                val color = if (isMajor) IslamicGold else IslamicMint.copy(alpha = 0.3f)
                // Draw circular degree markers
            }
        }

        // Qibla Pointer Needle
        Box(
            modifier = Modifier
                .fillMaxSize()
                .rotate(animatedRotation),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "🕋",
                    fontSize = 28.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .width(4.dp)
                        .height(60.dp)
                        .background(IslamicGold, RoundedCornerShape(2.dp))
                )
            }
        }
    }
}

/**
 * 3. Daily Khatmah Progress Bar in Jetpack Compose
 */
@Composable
fun KhatmahProgressComposeCard(
    currentJuz: Int,
    targetJuz: Int = 30,
    currentSurahName: String,
    onProgressClick: () -> Unit
) {
    val progress = (currentJuz.toFloat() / targetJuz.toFloat()).coerceIn(0f, 1f)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .clickable { onProgressClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = IslamicEmeraldCard),
        border = androidx.compose.foundation.BorderStroke(1.dp, IslamicMint.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "الجزء $currentJuz من $targetJuz",
                    color = IslamicGold,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                Text(
                    text = "ختمة القرآن: $currentSurahName",
                    color = IslamicTextWhite,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = IslamicGold,
                trackColor = Color.Black.copy(alpha = 0.4f),
            )
        }
    }
}
