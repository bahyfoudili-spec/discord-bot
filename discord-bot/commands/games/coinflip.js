const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('ارمي عملة 🪙'),
  cooldown: 2,

  async execute(interaction) {
    const result = Math.random() < 0.5 ? '👑 صورة' : '🔢 كتابة';
    const color = result.includes('صورة') ? '#FFD700' : '#C0C0C0';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🪙 رمي العملة')
      .setDescription(`## ${result}`)
      .setFooter({ text: `رمى ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
  },
};
