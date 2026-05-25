const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/autoresponder.json');

function load() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, '{}');
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}
function save(data) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoresponder')
    .setDescription('ردود تلقائية 🤖')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('add').setDescription('إضافة رد تلقائي')
         .addStringOption(opt => opt.setName('trigger').setDescription('الكلمة المحفزة').setRequired(true))
         .addStringOption(opt => opt.setName('response').setDescription('الرد').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('حذف رد تلقائي')
         .addStringOption(opt => opt.setName('trigger').setDescription('الكلمة').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list').setDescription('قائمة الردود التلقائية')
    ),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const data = load();
    if (!data[guildId]) data[guildId] = {};

    if (sub === 'add') {
      const trigger = interaction.options.getString('trigger').toLowerCase();
      const response = interaction.options.getString('response');
      data[guildId][trigger] = response;
      save(data);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#00FF00')
          .setDescription(`✅ تم إضافة الرد التلقائي!\n**المحفز:** \`${trigger}\`\n**الرد:** ${response}`)],
        ephemeral: true
      });
    }

    if (sub === 'remove') {
      const trigger = interaction.options.getString('trigger').toLowerCase();
      if (!data[guildId][trigger]) {
        return interaction.reply({ content: '❌ ما لقيت هذا المحفز!', ephemeral: true });
      }
      delete data[guildId][trigger];
      save(data);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`🗑️ تم حذف الرد التلقائي للكلمة: \`${trigger}\``)],
        ephemeral: true
      });
    }

    if (sub === 'list') {
      const triggers = Object.keys(data[guildId] || {});
      if (triggers.length === 0) {
        return interaction.reply({ content: '📭 ما فيه ردود تلقائية بعد!', ephemeral: true });
      }
      const list = triggers.map((t, i) => `**${i + 1}.** \`${t}\` → ${data[guildId][t]}`).join('\n');
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🤖 الردود التلقائية').setDescription(list)],
        ephemeral: true
      });
    }
  },
};
