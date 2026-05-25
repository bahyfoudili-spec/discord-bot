// ─── KICK ────────────────────────────────────────────────────────────────────
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// kick.js
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('طرد عضو من السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt =>
      opt.setName('user').setDescription('العضو اللي تبغي تطرده').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('سبب الطرد').setRequired(false)
    ),
  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'بدون سبب';

    if (!target) return interaction.reply({ content: '❌ ما لقيت العضو!', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ ما أقدر أطرد هذا العضو!', ephemeral: true });

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('👢 تم الطرد')
      .addFields(
        { name: 'العضو', value: `${target.user.tag}`, inline: true },
        { name: 'المود', value: `${interaction.user.tag}`, inline: true },
        { name: 'السبب', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
