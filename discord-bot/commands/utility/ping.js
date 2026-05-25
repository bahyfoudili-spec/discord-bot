const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('تحقق من سرعة البوت 🏓'),
  cooldown: 5,

  async execute(interaction) {
    const sent = await interaction.reply({ content: '⏳ جاري الحساب...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor(latency < 100 ? '#00FF00' : latency < 300 ? '#FFA500' : '#FF0000')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '📡 Latency', value: `${latency}ms`, inline: true },
        { name: '💓 API Ping', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};
