const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

const queues = global.musicQueues || (global.musicQueues = new Map());

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('تخطي الأغنية الحالية ⏭️'),
  cooldown: 3,

  async execute(interaction) {
    const serverQueue = queues.get(interaction.guild.id);

    if (!serverQueue || serverQueue.player.state.status !== AudioPlayerStatus.Playing) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ ما فيه أغنية شغالة!')],
        ephemeral: true
      });
    }

    serverQueue.player.stop();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor('#1DB954').setDescription('⏭️ تم تخطي الأغنية!')]
    });
  },
};
