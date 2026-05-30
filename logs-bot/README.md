# 📋 بوت اللوقات

بوت ديسكورد متخصص لتسجيل كل الأحداث من ماينكرافت وديسكورد.

## ⚙️ الإعداد

### 1. حط الـ Token وIDs القنوات في `.env`
انسخ `.env.example` وسميه `.env` وعبي البيانات.

### 2. شغّل البوت
```bash
npm install
npm start
```

## 🔗 ربط ماينكرافت (DiscordSRV)

في ملف `plugins/DiscordSRV/config.yml` أضف:

```yaml
DiscordChatChannelConsoleCommandExecutedWildcardWhitelist: ".*"
```

وفي `plugins/DiscordSRV/messages.yml` عدّل الرسائل لترسل للبوت عبر:
```
POST http://رابط_البوت/minecraft
```

مع body:
```json
{ "type": "kill", "data": { "killer": "اسم", "victim": "اسم", ... } }
```

## 📊 أنواع اللوقات

### ديسكورد (تلقائي):
- دخول/خروج أعضاء
- باند/فريس
- إعطاء/سحب رتب
- إنشاء/حذف قنوات
- تغيير أسماء

### ماينكرافت (عبر webhook):
- قتل، موت، دخول، خروج
- باند، ميوت، كيك
- أوامر
