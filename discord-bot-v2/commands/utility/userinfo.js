const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('معلومات عضو')
    .addUserOption(opt =>
      opt.setName('user').setDescription('العضو (اتركه فارغ لمعلوماتك)').setRequired(false)
    ),
  cooldown: 5,

  async execute(interaction) {
    const member = interaction.options.getMember('user') ?? interaction.member;
    const user = member.user;

    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .map(r => r.toString())
      .slice(0, 10)
      .join(', ') || 'لا يوجد';

    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor || '#5865F2')
      .setTitle(`👤 معلومات ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🏷️ الاسم', value: user.tag, inline: true },
        { name: '🆔 الـ ID', value: user.id, inline: true },
        { name: '📅 انضم لديسكورد', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '📥 انضم للسيرفر', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: '🤖 بوت؟', value: user.bot ? 'نعم' : 'لا', inline: true },
        { name: `🎭 الأدوار (${member.roles.cache.size - 1})`, value: roles, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
