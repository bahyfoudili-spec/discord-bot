const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض جميع الأوامر المتاحة'),
  cooldown: 5,

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 قائمة الأوامر')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: '🛡️ المودريشن',
          value: '`/kick` `/ban` `/mute` `/warn` `/clear`',
          inline: false,
        },
        {
          name: '🎵 الموسيقى',
          value: '`/play` `/skip` `/stop` `/queue` `/pause`',
          inline: false,
        },
        {
          name: '🎮 الألعاب والترفيه',
          value: '`/rps` `/coinflip` `/trivia` `/8ball`',
          inline: false,
        },
        {
          name: '🛠️ يوتيليتي',
          value: '`/userinfo` `/serverinfo` `/avatar` `/ping`',
          inline: false,
        },
        {
          name: '😄 تسلية',
          value: '`/joke` `/meme` `/quote` `/roll`',
          inline: false,
        }
      )
      .setFooter({ text: `طلب من ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
