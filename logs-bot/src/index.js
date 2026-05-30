require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const setupDiscordEvents = require('./events/discordEvents');
const setupMinecraftWebhook = require('./handlers/minecraftHandler');

// ─── Discord Client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.GuildMember, Partials.User],
});

// ─── Express Server (لاستقبال لوقات ماينكرافت) ────────────────────────────────
const app = express();
app.use(express.json());
setupMinecraftWebhook(app, client);
app.listen(process.env.PORT || 3000, () => console.log('🌐 Webhook server running'));

// ─── Discord Events ────────────────────────────────────────────────────────────
setupDiscordEvents(client);

// ─── Login ─────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ البوت شغال كـ ${client.user.tag}`);
  client.user.setActivity('📋 تسجيل اللوقات', { type: 3 });
});

client.login(process.env.BOT_TOKEN);
