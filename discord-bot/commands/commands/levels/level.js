const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/levels.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return {}; }
}

function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function getUser(db, id) {
  if (!db[id]) db[id] = { xp: 0, level: 1, messages: 0 };
  return db[id];
}

function xpForLevel(level) { return level * level * 100; }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('⭐ نظام المستويات')
    .addSubcommand(sub => sub.setName('rank').setDescription('شوف مستواك أو مستوى شخص').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(false)))
    .addSubcommand(sub => sub.setName('top').setDescription('🏆 أعلى 10 مستويات'))
    .addSubcommand(sub =>
      sub.setName('setxp').setDescription('👑 [أدمن] تعديل XP عضو')
        .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
        .addIntegerOption(o => o.setName('xp').setDescription('الكمية').setRequired(true))
    ),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = loadDB();

    if (sub === 'rank') {
      const target = interaction.options.getUser('user') || interaction.user;
      const user = getUser(db, target.id);
      const needed = xpForLevel(user.level + 1);
      const progress = Math.floor((user.xp / needed) * 20);
      const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`⭐ مستوى ${target.username}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: '🎯 المستوى', value: `**${user.level}**`, inline: true },
          { name: '✨ XP', value: `**${user.xp}** / ${needed}`, inline: true },
          { name: '💬 الرسائل', value: `**${user.messages}**`, inline: true },
          { name: '📊 التقدم', value: `\`${bar}\` ${Math.floor((user.xp / needed) * 100)}%`, inline: false },
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'top') {
      const sorted = Object.entries(db)
        .sort(([, a], [, b]) => b.level !== a.level ? b.level - a.level : b.xp - a.xp)
        .slice(0, 10);

      if (!sorted.length) return interaction.reply({ content: '📭 ما في أحد عنده مستوى بعد!', ephemeral: true });
      const medals = ['🥇', '🥈', '🥉'];
      const lines = await Promise.all(sorted.map(async ([id, data], i) => {
        let name = id;
        try { const u = await interaction.client.users.fetch(id); name = u.username; } catch {}
        return `${medals[i] || `**${i + 1}.**`} ${name} — مستوى **${data.level}** (${data.xp} XP)`;
      }));

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 أعلى اللاعبين مستوى')
        .setDescription(lines.join('\n'))
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'setxp') {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ content: '❌ هذا الأمر للأدمن فقط!', ephemeral: true });
      }
      const target = interaction.options.getUser('user');
      const xpAmount = interaction.options.getInteger('xp');
      const user = getUser(db, target.id);
      user.xp = Math.max(0, xpAmount);

      // Recalculate level
      while (user.xp >= xpForLevel(user.level + 1)) user.level++;
      while (user.level > 1 && user.xp < xpForLevel(user.level)) user.level--;

      saveDB(db);
      return interaction.reply({ content: `✅ تم تعديل XP لـ **${target.username}** إلى **${user.xp}** (مستوى ${user.level})`, ephemeral: true });
    }
  },
};
