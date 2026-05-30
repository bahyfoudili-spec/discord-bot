const { EmbedBuilder } = require('discord.js');

function getChannel(client, id) {
  return id ? client.channels.cache.get(id) : null;
}

module.exports = function setupMinecraftWebhook(app, client) {
  // DiscordSRV يرسل للبوت عبر هذا الـ endpoint
  app.post('/minecraft', (req, res) => {
    const { type, data } = req.body;
    if (!type || !data) return res.status(400).json({ error: 'بيانات ناقصة' });

    const C = process.env;
    let embed, channelId;

    switch (type) {

      // ─── قتل ────────────────────────────────────────────────────────────────
      case 'kill':
        channelId = C.MC_CH_KILL;
        embed = new EmbedBuilder()
          .setColor('#FF4444')
          .setTitle('⚔️ عملية قتل')
          .setThumbnail(`https://mineskin.eu/helm/${data.killer}/100.png`)
          .addFields(
            { name: '⚔️ القاتل', value: data.killer || 'غير معروف', inline: true },
            { name: '💀 الضحية', value: data.victim || 'غير معروف', inline: true },
            { name: '🗡️ السلاح', value: data.weapon || 'يد فارغة', inline: true },
            { name: '📍 المكان', value: data.location || 'غير معروف', inline: false },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── موت ────────────────────────────────────────────────────────────────
      case 'death':
        channelId = C.MC_CH_DEATH;
        embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('💀 وفاة لاعب')
          .setThumbnail(`https://mineskin.eu/helm/${data.player}/100.png`)
          .addFields(
            { name: '👤 اللاعب', value: data.player || 'غير معروف', inline: true },
            { name: '💬 السبب', value: data.cause || 'غير معروف', inline: true },
            { name: '📍 المكان', value: data.location || 'غير معروف', inline: false },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── دخول لاعب ──────────────────────────────────────────────────────────
      case 'join':
        channelId = C.MC_CH_JOIN;
        embed = new EmbedBuilder()
          .setColor('#00FF7F')
          .setTitle('🟢 لاعب دخل السيرفر')
          .setThumbnail(`https://mineskin.eu/helm/${data.player}/100.png`)
          .addFields(
            { name: '👤 اللاعب', value: data.player || 'غير معروف', inline: true },
            { name: '👥 اللاعبين الحاليين', value: `${data.online || '?'} / ${data.max || '?'}`, inline: true },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── خروج لاعب ──────────────────────────────────────────────────────────
      case 'leave':
        channelId = C.MC_CH_LEAVE;
        embed = new EmbedBuilder()
          .setColor('#FF4444')
          .setTitle('🔴 لاعب خرج من السيرفر')
          .setThumbnail(`https://mineskin.eu/helm/${data.player}/100.png`)
          .addFields(
            { name: '👤 اللاعب', value: data.player || 'غير معروف', inline: true },
            { name: '⏱️ وقت اللعب', value: data.playtime || 'غير معروف', inline: true },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── باند ────────────────────────────────────────────────────────────────
      case 'ban':
        channelId = C.MC_CH_BAN;
        embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🔨 لاعب تم باند')
          .addFields(
            { name: '👤 اللاعب', value: data.player || 'غير معروف', inline: true },
            { name: '👮 المسؤول', value: data.admin || 'غير معروف', inline: true },
            { name: '📝 السبب', value: data.reason || 'لا يوجد', inline: false },
            { name: '⏰ المدة', value: data.duration || 'دائم', inline: true },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── ميوت ────────────────────────────────────────────────────────────────
      case 'mute':
        channelId = C.MC_CH_MUTE;
        embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🔇 لاعب تم ميوت')
          .addFields(
            { name: '👤 اللاعب', value: data.player || 'غير معروف', inline: true },
            { name: '👮 المسؤول', value: data.admin || 'غير معروف', inline: true },
            { name: '📝 السبب', value: data.reason || 'لا يوجد', inline: false },
            { name: '⏰ المدة', value: data.duration || 'دائم', inline: true },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── كيك ─────────────────────────────────────────────────────────────────
      case 'kick':
        channelId = C.MC_CH_KICK;
        embed = new EmbedBuilder()
          .setColor('#FF8C00')
          .setTitle('👢 لاعب تم كيك')
          .addFields(
            { name: '👤 اللاعب', value: data.player || 'غير معروف', inline: true },
            { name: '👮 المسؤول', value: data.admin || 'غير معروف', inline: true },
            { name: '📝 السبب', value: data.reason || 'لا يوجد', inline: false },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      // ─── أوامر ───────────────────────────────────────────────────────────────
      case 'command':
        channelId = C.MC_CH_COMMAND;
        embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('💻 أمر نُفِّذ')
          .addFields(
            { name: '👤 المنفذ', value: data.player || 'Console', inline: true },
            { name: '📝 الأمر', value: `\`${data.command || 'غير معروف'}\``, inline: false },
          )
          .setFooter({ text: 'Minecraft Logs' })
          .setTimestamp();
        break;

      default:
        return res.status(400).json({ error: 'نوع غير معروف' });
    }

    const channel = getChannel(client, channelId);
    if (channel) {
      channel.send({ embeds: [embed] }).catch(() => {});
    }

    res.json({ success: true });
  });
};
