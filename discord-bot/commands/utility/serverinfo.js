const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('معلومات السيرفر 🏠'),
  cooldown: 5,

  async execute(interaction) {
    const { guild } = interaction;
    await guild.fetch();

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🏠 معلومات ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
        { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '💬 الشانيلات', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 الأدوار', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 الإيموجي', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🔒 الفيريفيكيشن', value: `${guild.verificationLevel}`, inline: true }
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
