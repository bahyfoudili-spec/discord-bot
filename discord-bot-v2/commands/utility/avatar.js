const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('عرض صورة البروفايل')
    .addUserOption(opt =>
      opt.setName('user').setDescription('العضو').setRequired(false)
    ),
  cooldown: 3,

  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🖼️ صورة ${user.username}`)
      .setImage(avatar)
      .addFields(
        { name: '🔗 رابط مباشر', value: `[اضغط هنا](${avatar})` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
