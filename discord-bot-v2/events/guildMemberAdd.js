const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // Change this to your welcome channel name or ID
    const welcomeChannel = member.guild.channels.cache.find(
      ch => ch.name === 'welcome' || ch.name === 'الترحيب'
    );
    if (!welcomeChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`👋 أهلاً وسهلاً ${member.user.username}!`)
      .setDescription(
        `مرحباً في **${member.guild.name}**! 🎉\n\n` +
        `أنت العضو رقم **${member.guild.memberCount}**.\n` +
        `اقرأ القواعد وانبسط معنا! 😄`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
      .setTimestamp();

    welcomeChannel.send({ embeds: [embed] });
  },
};
