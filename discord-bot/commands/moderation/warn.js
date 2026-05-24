const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Simple JSON-based warning storage
const warningsPath = path.join(__dirname, '../../data/warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) {
    fs.mkdirSync(path.dirname(warningsPath), { recursive: true });
    fs.writeFileSync(warningsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
}

function saveWarnings(data) {
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('إنذار عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('user').setDescription('العضو').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('السبب').setRequired(true)
    ),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    const warnings = loadWarnings();
    const key = `${interaction.guild.id}_${target.id}`;

    if (!warnings[key]) warnings[key] = [];
    warnings[key].push({
      reason,
      mod: interaction.user.tag,
      date: new Date().toISOString(),
    });
    saveWarnings(warnings);

    const count = warnings[key].length;

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⚠️ إنذار')
      .addFields(
        { name: 'العضو', value: `${target.user.tag}`, inline: true },
        { name: 'إجمالي الإنذارات', value: `${count}`, inline: true },
        { name: 'السبب', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Auto-action on 3+ warnings
    if (count >= 3) {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription(`🚨 ${target.user.tag} وصل لـ ${count} إنذارات! فكر تعمل له باند أو ميوت.`)
        ],
        ephemeral: true,
      });
    }
  },
};
