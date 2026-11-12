# دليل بناء وتوزيع والتحديث المستمر لتطبيق حق الله (Haqq Allah Android APK)

يحتوي هذا الدليل على التعليمات الدقيقة لتشغيل وبناء ملفات Android APK (نسخة Debug ونسخة Release الموقعة) باستخدام **Android Studio** أو **سطر الأوامر (Gradle)**، بالإضافة إلى خطوات نشر التحديثات المستقبلية للمستخدمين بأمان مع الحفاظ الكامل على بياناتهم.

---

## 1. مواصفات مشروع الأندرويد الجاهز (`/android`)

- **Application ID:** `com.haqqallah.app` (ثابت في كل الإصدارات لضمان الترقية فوق النسخة المثبتة دون فقدان البيانات)
- **الإصدار الحالي:** `versionName = 3.0.0` · `versionCode = 30` (مُدار مركزياً في `android/version.properties`)
- **نطاق التوافق:** `minSdk 24` (Android 7.0+) إلى `targetSdk 34` (Android 14) — متوافق بالكامل مع **Android 8.0 والأحدث**
- **أبرز المكونات المدمجة:**
  - `MainActivity.kt` + `UpdateManager.kt`: حاوية التطبيق مع جسر التحديثات، التحقق من بصمة **SHA-256**، ودعم `FileProvider` و`REQUEST_INSTALL_PACKAGES` على Android 8+
  - `AthanForegroundService.kt` + `AthanAlarmReceiver.kt`: الأذان الدقيق في الخلفية والعمل فوق شاشة القفل
  - `HaqqAllahAppWidget.kt`: ودجت الشاشة الرئيسية
  - أيقونات Launcher متعددة الكثافات (`mipmap-mdpi` إلى `mipmap-xxxhdpi` + `mipmap-anydpi-v26`) وشاشة Splash Screen متوافقة مع Android 8+

---

## 2. تجهيز الأصول وبناء APK في Android Studio

### الخطوة 1: بناء واجهة الويب ومزامنتها داخل مشروع الأندرويد
من جذر المشروع نفّذ:
```bash
npm install
npm run build
npm run android:sync
```
يقوم `npm run android:sync` بنسخ حزمة `dist/` إلى `android/app/src/main/assets/dist/` وملفات الأذان الصوتية إلى `android/app/src/main/assets/audio/`.

### الخطوة 2: فتح المشروع في Android Studio
1. افتح **Android Studio** واختر **Open** ثم حدد مجلد `android/` داخل هذا المستودع.
2. انتظر حتى يكتمل **Gradle Sync** (يتطلب JDK 17 وAndroid SDK 34).
3. **لبناء Debug APK (للاختبار):**
   - من القائمة العلوية: **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**
   - أو من تبويب **Build Variants** اختر `debug` ثم شغّل التطبيق على جهازك أو المحاكي (`Android 8.0+`).
   - مسار المخرج: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. إعداد التوقيع الرقمي وبناء Signed Release APK

> **مهم جداً:** يجب استخدام **نفس شهادة التوقيع (`release-keystore.jks`)** ونفس `applicationId` (`com.haqqallah.app`) في جميع الإصدارات، وإلا سيرفض أندرويد تثبيت التحديث فوق النسخة السابقة.

### إنشاء مفتاح التوقيع لأول مرة فقط
```bash
keytool -genkey -v \
  -keystore android/release-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias haqqallah
```

### تهيئة ملف `android/keystore.properties` (لا يُرفع إلى Git أبداً)
انسخ القالب:
```bash
cp android/keystore.properties.example android/keystore.properties
```
ثم ضع بياناتك داخل `android/keystore.properties`:
```properties
storeFile=release-keystore.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=haqqallah
keyPassword=YOUR_KEY_PASSWORD
```

### بناء Signed Release APK
- **عبر Android Studio:**
  - **Build ▸ Generate Signed Bundle / APK... ▸ APK ▸ Next**
  - اختر `android/release-keystore.jks` وأدخل كلمة المرور و`haqqallah` ثم اختر `release` واضغط **Create**.
- **عبر سطر الأوامر:**
  ```bash
  ./scripts/build-android.sh
  ```
  أو مباشرة من داخل `android/`:
  ```bash
  cd android && ./gradlew assembleRelease
  ```
- مسار ملف Release الموقع:
  `android/app/build/outputs/apk/release/app-release.apk`

---

## 4. خطوات نشر إصدار وتحديث مستقبلي للمستخدمين (Release Workflow)

كل تحديث جديد يتبع هذه الخطوات الثابتة:

1. **تطوير التعديلات البرمجية واختبارها:**
   ```bash
   npm run lint
   ```
2. **رفع رقم الإصدار مركزياً (`versionCode` و `versionName`):**
   يجب أن يكون `versionCode` أكبر رقمياً من الإصدار السابق دائماً:
   ```bash
   npm run release:bump -- --code 31 --name 3.1.0
   ```
   *(يحدّث هذا الأمر تلقائياً كلاً من `android/version.properties` و`package.json` و`src/config/version.ts` و`releases/version-manifest.json`)*
3. **بناء واجهة الويب ومزامنتها وبناء Signed Release APK:**
   ```bash
   npm run build
   npm run android:sync
   cd android && ./gradlew assembleRelease
   ```
4. **نشر الـ APK وتحديث ملف البيان (`version-manifest.json`) مع حساب SHA-256:**
   ```bash
   npm run release:publish -- --apk android/app/build/outputs/apk/release/app-release.apk
   ```
   - ولجعل التحديث **إلزامياً (Mandatory)** أضف `--mandatory`.
   - ولإضافة ملاحظة إصدار جديدة أضف `--note "وصف التحديث"`.
   - وعند استضافة ملف الـ APK على CDN/Firebase/GitHub Releases أضف `--apk-url "https://.../haqq-allah-v3.1.0-release.apk"`.
5. **إتاحة التحديث على الخادم:**
   - إذا كنت تستضيف الملفات مباشرة على هذا الخادم، فسيبدأ المسار `/api/download/apk` فوراً بتقديم ملف `releases/haqq-allah-v*.apk` الجديد مع ترويسة `X-Checksum-SHA256`، وسيكتشف التطبيق التحديث تلقائياً عند التشغيل أو الفحص الدوري عبر `/api/updates/check`.
   - أو انشر عبر CI/CD (`.github/workflows/build_apk.yml`) عبر إضافة Secrets في GitHub: `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.

---

## 5. التحقق من الحفاظ على البيانات والأمان (Android 8+)

- **حفظ بيانات المستخدمين:** تثبيت النسخة الجديدة فوق المثبتة عبر `PackageInstaller` / `FileProvider` يحتفظ بكامل `localStorage` و`SharedPreferences` وقواعد البيانات المحلية دون حذف التطبيق.
- **التحقق من السلامة (SHA-256):** يتحقق `UpdateManager.kt` (وعلى الويب `WebCrypto`) من تطابق بصمة `SHA-256` قبل عرض شاشة التثبيت على المستخدم.
- **سياسة الأذونات:** يطلب التطبيق إذن `REQUEST_INSTALL_PACKAGES` في Android 8.0+ بشكل صريح عبر شاشة إعدادات النظام ولا يقوم بأي تثبيت صامت في الخلفية.
- **صفحة التنزيل والمشاركة:** متاحة دائماً عبر الرابط `/download` ويمكن مشاركتها مع الآخرين من داخل شاشة الإعدادات أو صفحة التنزيل.
