const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('إحصائيات السيرفر المفصلة 📊'),
  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();
    const { guild } = interaction;
    await guild.fetch();
    await guild.members.fetch();

    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;
    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const roles = guild.roles.cache.size - 1;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;

    const createdDays = Math.floor((Date.now() - guild.createdTimestamp) / 86400000);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 إحصائيات ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '👥 الأعضاء', value: `الكل: **${totalMembers}**\nبشر: **${humans}**\nبوتات: **${bots}**`, inline: true },
        { name: '🟢 أونلاين', value: `**${online}**`, inline: true },
        { name: '💬 الشانيلات', value: `نص: **${textChannels}**\nصوت: **${voiceChannels}**`, inline: true },
        { name: '🎭 الأدوار', value: `**${roles}**`, inline: true },
        { name: '😀 الإيموجي', value: `**${emojis}**`, inline: true },
        { name: '🚀 البوستات', value: `**${boosts}** (Level ${boostLevel})`, inline: true },
        { name: '📅 عمر السيرفر', value: `**${createdDays}** يوم`, inline: true },
        { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
