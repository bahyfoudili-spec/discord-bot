const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skin')
    .setDescription('🧑 شوف سكن لاعب ماينكرافت')
    .addStringOption(opt =>
      opt.setName('username').setDescription('اسم اللاعب').setRequired(true)
    ),
  cooldown: 5,

  async execute(interaction) {
    const username = interaction.options.getString('username');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🧑 سكن: ${username}`)
      .setDescription(`سكن اللاعب **${username}** في ماينكرافت`)
      .addFields(
        { name: '🔗 تحميل السكن', value: `[اضغط هنا](https://mineskin.eu/skin/${username})`, inline: true },
        { name: '📋 UUID', value: `[namemc.com](https://namemc.com/profile/${username})`, inline: true },
      )
      .setThumbnail(`https://mineskin.eu/helm/${username}/100.png`)
      .setImage(`https://mineskin.eu/skin/${username}`)
      .setFooter({ text: `طلب من: ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
