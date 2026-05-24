const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('ميوت عضو (تايم أوت)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('user').setDescription('العضو').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('minutes').setDescription('المدة (دقائق)').setRequired(true).setMinValue(1).setMaxValue(40320)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('السبب').setRequired(false)
    ),
  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') ?? 'بدون سبب';

    if (!target.moderatable) {
      return interaction.reply({ content: '❌ ما أقدر أميوت هذا العضو!', ephemeral: true });
    }

    const duration = minutes * 60 * 1000;
    await target.timeout(duration, reason);

    const embed = new EmbedBuilder()
      .setColor('#808080')
      .setTitle('🔇 تم الميوت')
      .addFields(
        { name: 'العضو', value: `${target.user.tag}`, inline: true },
        { name: 'المدة', value: `${minutes} دقيقة`, inline: true },
        { name: 'السبب', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
