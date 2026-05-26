const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/ticketstats.json');

function load() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, '{}');
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketstats')
    .setDescription('إحصائيات التذاكر 📊')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 5,

  async execute(interaction) {
    const data = load();
    const guildData = data[interaction.guild.id] || { total: 0, claimed: 0, closed: 0, staff: {} };

    // أكثر موظف استلم تذاكر
    const topStaff = Object.entries(guildData.staff || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count], i) => `**${i+1}.** <@${id}> — ${count} تذكرة`)
      .join('\n') || 'لا يوجد بعد';

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 إحصائيات التذاكر')
      .addFields(
        { name: '🎫 إجمالي التذاكر', value: `**${guildData.total || 0}**`, inline: true },
        { name: '✅ المستلمة', value: `**${guildData.claimed || 0}**`, inline: true },
        { name: '🔒 المغلقة', value: `**${guildData.closed || 0}**`, inline: true },
        { name: '🏆 أكثر موظف استلاماً', value: topStaff, inline: false },
      )
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
