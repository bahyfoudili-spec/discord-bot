const { EmbedBuilder, AuditLogEvent } = require('discord.js');

function getChannel(client, id) {
  return id ? client.channels.cache.get(id) : null;
}

function sendLog(channel, embed) {
  if (!channel) return;
  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = function setupDiscordEvents(client) {
  const C = process.env;

  // ─── دخول عضو ──────────────────────────────────────────────────────────────
  client.on('guildMemberAdd', member => {
    const ch = getChannel(client, C.CH_MEMBER_JOIN);
    const embed = new EmbedBuilder()
      .setColor('#00FF7F')
      .setTitle('📥 عضو جديد انضم')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '👤 العضو', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: '📅 حساب منشأ', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 عدد الأعضاء', value: `${member.guild.memberCount}`, inline: true },
      )
      .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });

  // ─── خروج عضو ──────────────────────────────────────────────────────────────
  client.on('guildMemberRemove', member => {
    const ch = getChannel(client, C.CH_MEMBER_LEAVE);
    const embed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('📤 عضو غادر السيرفر')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '👤 العضو', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: '📅 انضم', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'غير معروف', inline: true },
      )
      .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });

  // ─── باند ──────────────────────────────────────────────────────────────────
  client.on('guildBanAdd', async ban => {
    const ch = getChannel(client, C.CH_BAN);
    await new Promise(r => setTimeout(r, 500));
    let reason = 'لا يوجد', mod = 'غير معروف';
    try {
      const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBan, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === ban.user.id) {
        reason = entry.reason || 'لا يوجد';
        mod = entry.executor?.tag || 'غير معروف';
      }
    } catch {}
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔨 عضو تم باند')
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: '👤 العضو', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: '👮 المسؤول', value: mod, inline: true },
        { name: '📝 السبب', value: reason, inline: false },
      )
      .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });

  // ─── فريس ──────────────────────────────────────────────────────────────────
  client.on('guildBanRemove', async ban => {
    const ch = getChannel(client, C.CH_UNBAN);
    let mod = 'غير معروف';
    try {
      const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUnban, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === ban.user.id) mod = entry.executor?.tag || 'غير معروف';
    } catch {}
    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('🔓 عضو تم فريسه')
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: '👤 العضو', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: '👮 المسؤول', value: mod, inline: true },
      )
      .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });

  // ─── إعطاء/سحب رتبة ────────────────────────────────────────────────────────
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
    if (!addedRoles.size && !removedRoles.size) return;

    let mod = 'غير معروف';
    try {
      const logs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === newMember.id) mod = entry.executor?.tag || 'غير معروف';
    } catch {}

    if (addedRoles.size) {
      const ch = getChannel(client, C.CH_ROLE_GIVE);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎖️ إعطاء رتبة')
        .addFields(
          { name: '👤 العضو', value: `${newMember.user.tag}`, inline: true },
          { name: '👮 المسؤول', value: mod, inline: true },
          { name: '🏷️ الرتبة', value: addedRoles.map(r => r.toString()).join(', '), inline: false },
        )
        .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })
        .setTimestamp();
      sendLog(ch, embed);
    }

    if (removedRoles.size) {
      const ch = getChannel(client, C.CH_ROLE_REMOVE);
      const embed = new EmbedBuilder()
        .setColor('#FF8C00')
        .setTitle('🗑️ سحب رتبة')
        .addFields(
          { name: '👤 العضو', value: `${newMember.user.tag}`, inline: true },
          { name: '👮 المسؤول', value: mod, inline: true },
          { name: '🏷️ الرتبة', value: removedRoles.map(r => r.toString()).join(', '), inline: false },
        )
        .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })
        .setTimestamp();
      sendLog(ch, embed);
    }
  });

  // ─── إنشاء قناة ────────────────────────────────────────────────────────────
  client.on('channelCreate', async channel => {
    const ch = getChannel(client, C.CH_CHANNEL_CREATE);
    let mod = 'غير معروف';
    try {
      const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
      const entry = logs.entries.first();
      if (entry) mod = entry.executor?.tag || 'غير معروف';
    } catch {}
    const embed = new EmbedBuilder()
      .setColor('#00FF7F')
      .setTitle('📢 قناة جديدة أنشئت')
      .addFields(
        { name: '📌 القناة', value: `${channel.toString()} (${channel.name})`, inline: true },
        { name: '👮 المسؤول', value: mod, inline: true },
      )
      .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });

  // ─── حذف قناة ──────────────────────────────────────────────────────────────
  client.on('channelDelete', async channel => {
    const ch = getChannel(client, C.CH_CHANNEL_DELETE);
    let mod = 'غير معروف';
    try {
      const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
      const entry = logs.entries.first();
      if (entry) mod = entry.executor?.tag || 'غير معروف';
    } catch {}
    const embed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('🗑️ قناة حذفت')
      .addFields(
        { name: '📌 القناة', value: channel.name, inline: true },
        { name: '👮 المسؤول', value: mod, inline: true },
      )
      .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });

  // ─── تغيير اسم عضو ─────────────────────────────────────────────────────────
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.nickname === newMember.nickname && oldMember.user.username === newMember.user.username) return;
    const ch = getChannel(client, C.CH_NICKNAME);
    if (!ch) return;
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('✏️ تغيير اسم عضو')
      .addFields(
        { name: '👤 العضو', value: newMember.user.tag, inline: true },
        { name: '📝 الاسم القديم', value: oldMember.nickname || oldMember.user.username, inline: true },
        { name: '📝 الاسم الجديد', value: newMember.nickname || newMember.user.username, inline: true },
      )
      .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })
      .setTimestamp();
    sendLog(ch, embed);
  });
};
