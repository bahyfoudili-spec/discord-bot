const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('باند عضو من السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt =>
      opt.setName('user').setDescription('العضو اللي تبغي تبنه').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('سبب الباند').setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('days').setDescription('حذف رسائله (أيام)').setMinValue(0).setMaxValue(7).setRequired(false)
    ),
  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'بدون سبب';
    const days = interaction.options.getInteger('days') ?? 0;

    if (!target) return interaction.reply({ content: '❌ ما لقيت العضو!', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ ما أقدر أبن هذا العضو!', ephemeral: true });

    await target.ban({ deleteMessageDays: days, reason });

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔨 تم الباند')
      .addFields(
        { name: 'العضو', value: `${target.user.tag}`, inline: true },
        { name: 'المود', value: `${interaction.user.tag}`, inline: true },
        { name: 'السبب', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
