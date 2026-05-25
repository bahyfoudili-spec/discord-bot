const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Shared queue map - imported by play.js too
const queues = global.musicQueues || (global.musicQueues = new Map());

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('عرض قائمة الأغاني 🎵'),
  cooldown: 3,

  async execute(interaction) {
    const serverQueue = queues.get(interaction.guild.id);

    if (!serverQueue || (!serverQueue.current && serverQueue.queue.length === 0)) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ ما فيه موسيقى شغالة الحين!')],
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle('🎵 قائمة الأغاني');

    if (serverQueue.current) {
      embed.addFields({ name: '▶️ يشتغل الحين', value: `${serverQueue.current.title} | ${serverQueue.current.duration}` });
    }

    if (serverQueue.queue.length > 0) {
      const list = serverQueue.queue
        .slice(0, 10)
        .map((s, i) => `**${i + 1}.** ${s.title} | ${s.duration}`)
        .join('\n');
      embed.addFields({ name: '📋 القائمة', value: list });
    } else {
      embed.addFields({ name: '📋 القائمة', value: 'فارغة' });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
