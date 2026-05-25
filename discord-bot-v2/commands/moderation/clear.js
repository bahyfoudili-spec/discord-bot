const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('مسح رسائل من الشانيل')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('amount').setDescription('عدد الرسائل (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    ),
  cooldown: 5,

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setDescription(`🗑️ تم مسح **${deleted.size}** رسالة بنجاح!`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
