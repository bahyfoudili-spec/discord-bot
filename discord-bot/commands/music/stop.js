const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

const stop = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('وقف الموسيقى وطرد البوت 🛑'),
  cooldown: 3,

  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ البوت مو في روم صوتي!')],
        ephemeral: true,
      });
    }
    connection.destroy();
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor('#FF0000').setTitle('🛑 تم إيقاف الموسيقى').setDescription('البوت طلع من الروم الصوتي')],
    });
  },
};

module.exports = stop;
