const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/rankroles.json');
function loadDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return {}; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rankrole')
    .setDescription('🎖️ ربط رتب ديسكورد بالمستويات')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('add').setDescription('أضف رتبة عند مستوى معين')
        .addIntegerOption(o => o.setName('level').setDescription('المستوى').setMinValue(1).setRequired(true))
        .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('احذف رتبة مستوى')
        .addIntegerOption(o => o.setName('level').setDescription('المستوى').setMinValue(1).setRequired(true))
    )
    .addSubcommand(sub => sub.setName('list').setDescription('شوف كل رتب المستويات')),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = loadDB();
    const guildId = interaction.guild.id;
    if (!db[guildId]) db[guildId] = {};

    if (sub === 'add') {
      const level = interaction.options.getInteger('level');
      const role = interaction.options.getRole('role');
      db[guildId][level] = role.id;
      saveDB(db);
      return interaction.reply({ content: `✅ رتبة **${role.name}** ستُعطى عند **المستوى ${level}**`, ephemeral: true });
    }

    if (sub === 'remove') {
      const level = interaction.options.getInteger('level');
      if (!db[guildId][level]) return interaction.reply({ content: '❌ ما في رتبة لهذا المستوى!', ephemeral: true });
      delete db[guildId][level];
      saveDB(db);
      return interaction.reply({ content: `✅ تم حذف رتبة المستوى **${level}**`, ephemeral: true });
    }

    if (sub === 'list') {
      const entries = Object.entries(db[guildId] || {}).sort(([a], [b]) => Number(a) - Number(b));
      if (!entries.length) return interaction.reply({ content: '📭 ما في رتب مستويات بعد!', ephemeral: true });

      const lines = entries.map(([level, roleId]) => `**المستوى ${level}** → <@&${roleId}>`);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎖️ رتب المستويات')
        .setDescription(lines.join('\n'))
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  },
};
