const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('نظام الفيريفيكيشن التلقائي 🔒')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('setup')
         .setDescription('إعداد نظام الفيريفيكيشن')
         .addRoleOption(opt => opt.setName('role').setDescription('الرول اللي يتعطى بعد الفيريفيكيشن').setRequired(true))
    ),
  cooldown: 10,

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ فيريفيكيشن')
      .setDescription(
        '**أهلاً بك في السيرفر!**\n\n' +
        '📋 قبل ما تدخل، اقرأ القواعد وبعدها اضغط الزر أدناه للتحقق من حسابك.\n\n' +
        '🔞 بالضغط على الزر، أنت توافق على قواعد السيرفر!'
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: interaction.guild.name });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_${role.id}`)
        .setLabel('✅ تحقق الآن')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ تم إعداد نظام الفيريفيكيشن!', ephemeral: true });
  },
};
