const { Events, EmbedBuilder } = require('discord.js');

// Map button IDs to role names (create these roles in your server)
const roleMap = {
  'role_news':         '📢 أخبار',
  'role_events':       '🎮 إيفنتات',
  'role_updates':      '🆕 تحديثات',
  'role_giveaway':     '🎁 هدايا',
  'role_polls':        '📝 استطلاعات',
  'role_partnerships': '🤝 شراكات',
};

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('role_')) return;

    const roleName = roleMap[interaction.customId];
    if (!roleName) return;

    const role = interaction.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      return interaction.reply({
        content: `❌ الرول **${roleName}** ما موجود! أنشئه في السيرفر أولاً.`,
        ephemeral: true
      });
    }

    const member = interaction.member;
    const hasRole = member.roles.cache.has(role.id);

    if (hasRole) {
      await member.roles.remove(role);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF4444')
          .setDescription(`🔕 تم إزالة دور **${roleName}** منك!`)],
        ephemeral: true
      });
    } else {
      await member.roles.add(role);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#57F287')
          .setDescription(`🔔 تم إعطاؤك دور **${roleName}**!`)],
        ephemeral: true
      });
    }
  },
};
