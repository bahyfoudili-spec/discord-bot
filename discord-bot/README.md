# 🤖 بوت ديسكورد كامل

بوت ديسكورد شامل مكتوب بـ JavaScript (Node.js) يحتوي على أوامر مودريشن، موسيقى، ألعاب، وترفيه!

---

## 📋 المتطلبات

- [Node.js](https://nodejs.org/) v18 أو أحدث
- حساب على [Discord Developer Portal](https://discord.com/developers/applications)
- FFmpeg (للموسيقى)

---

## 🚀 طريقة التشغيل

### 1️⃣ إنشاء البوت على ديسكورد

1. اذهب لـ [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط **New Application** وحط اسم البوت
3. اذهب لـ **Bot** → اضغط **Add Bot**
4. انسخ الـ **Token** (هذا سر، ما تشاركه أحد!)
5. فعّل **Message Content Intent** و **Server Members Intent** و **Presence Intent**
6. اذهب لـ **OAuth2 → URL Generator**، اختر `bot` و `applications.commands`
7. من الصلاحيات اختر ما تحتاج (Administrator للتجربة)
8. انسخ الرابط وافتحه لإضافة البوت لسيرفرك

### 2️⃣ إعداد المشروع

```bash
# نسخ المشروع
git clone <رابط المشروع>
cd discord-bot

# تثبيت المكتبات
npm install

# نسخ ملف الإعدادات
cp .env.example .env
```

### 3️⃣ ملف الإعدادات `.env`

```env
DISCORD_TOKEN=token_البوت_من_Developer_Portal
CLIENT_ID=ID_البوت_من_Developer_Portal_صفحة_General_Information
GUILD_ID=ID_سيرفرك_(كليك_يمين_على_السيرفر_→_Copy_Server_ID)
PREFIX=!
```

> لتفعيل Developer Mode: إعدادات ديسكورد → Advanced → Developer Mode ✅

### 4️⃣ تشغيل البوت

```bash
# أولاً: رفع الأوامر لديسكورد (مرة واحدة بس أو عند إضافة أمر جديد)
npm run deploy

# تشغيل البوت
npm start

# أو للتطوير مع إعادة تشغيل تلقائي
npm run dev
```

---

## 📜 قائمة الأوامر

### 🛡️ المودريشن

| الأمر | الوصف | الصلاحية |
|-------|--------|----------|
| `/kick @user [سبب]` | طرد عضو | Kick Members |
| `/ban @user [سبب] [أيام]` | باند عضو | Ban Members |
| `/mute @user <دقائق> [سبب]` | ميوت عضو (تايم أوت) | Moderate Members |
| `/warn @user <سبب>` | إنذار عضو مع تتبع | Moderate Members |
| `/clear <عدد>` | مسح رسائل (1-100) | Manage Messages |

### 🎵 الموسيقى

| الأمر | الوصف |
|-------|--------|
| `/play <رابط يوتيوب>` | تشغيل موسيقى |
| `/stop` | إيقاف الموسيقى وطرد البوت |

> ⚠️ **ملاحظة:** الموسيقى تحتاج FFmpeg على الجهاز. حمله من [ffmpeg.org](https://ffmpeg.org/download.html)

### 🎮 الألعاب

| الأمر | الوصف |
|-------|--------|
| `/rps` | حجر ورقة مقص |
| `/coinflip` | رمي عملة |
| `/roll [وجوه] [عدد]` | رمي نرد |

### 😄 الترفيه

| الأمر | الوصف |
|-------|--------|
| `/joke` | نكتة عشوائية |
| `/8ball <سؤال>` | الكرة السحرية |

### 🛠️ يوتيليتي

| الأمر | الوصف |
|-------|--------|
| `/ping` | تحقق من سرعة البوت |
| `/userinfo [@user]` | معلومات عضو |
| `/serverinfo` | معلومات السيرفر |
| `/avatar [@user]` | صورة البروفايل |
| `/help` | قائمة الأوامر |

---

## 📁 هيكل المشروع

```
discord-bot/
├── index.js              ← الملف الرئيسي
├── deploy-commands.js    ← رفع الأوامر لديسكورد
├── package.json
├── .env                  ← إعداداتك السرية
├── .env.example          ← مثال للإعدادات
├── commands/
│   ├── moderation/       ← kick, ban, mute, warn, clear
│   ├── music/            ← play, stop
│   ├── games/            ← rps, coinflip, roll
│   ├── fun/              ← joke, 8ball
│   └── utility/          ← ping, userinfo, serverinfo, avatar, help
├── events/
│   ├── ready.js          ← عند تشغيل البوت
│   ├── interactionCreate.js ← معالج الأوامر
│   └── guildMemberAdd.js ← ترحيب بالأعضاء الجدد
└── data/
    └── warnings.json     ← قاعدة بيانات الإنذارات
```

---

## ➕ إضافة أمر جديد

```js
// commands/utility/mycommand.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('وصف الأمر'),
  cooldown: 5, // بالثواني (اختياري)

  async execute(interaction) {
    await interaction.reply('مرحبا!');
  },
};
```

بعدها شغل:
```bash
npm run deploy
```

---

## 🔧 تخصيص الترحيب

في ملف `events/guildMemberAdd.js`، غير اسم الشانيل:
```js
const welcomeChannel = member.guild.channels.cache.find(
  ch => ch.name === 'welcome' // غير هذا لاسم شانيل الترحيب عندك
);
```

---

## ❓ مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| `Error: Used disallowed intents` | فعّل الـ Intents في Developer Portal |
| الأوامر ما تظهر | شغل `npm run deploy` |
| الموسيقى ما تشتغل | تأكد FFmpeg مثبت |
| `TOKEN is invalid` | تحقق من ملف `.env` |

---

## 📄 الترخيص

MIT — استخدم وعدل بحرية! 🎉
