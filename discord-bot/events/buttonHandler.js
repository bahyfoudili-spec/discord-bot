const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    // ─── Verify Button ────────────────────────────────────────────────────
    if (interaction.customId.startsWith('verify_')) {
      const roleId = interaction.customId.replace('verify_', '');
      const member = interaction.member;
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) return interaction.reply({ content: '❌ الرول ما لقيته!', ephemeral: true });
      if (member.roles.cache.has(roleId)) {
        return interaction.reply({ content: '✅ أنت محقق بالفعل!', ephemeral: true });
      }

      await member.roles.add(role);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم التحقق!')
            .setDescription(`أهلاً ${member}! تم منحك رول **${role.name}** ودخولك للسيرفر. انبسط! 🎉`)
        ],
        ephemeral: true
      });
    }

    // ─── Close Ticket Button ──────────────────────────────────────────────
    if (interaction.customId === 'ticket_close_btn') {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('🔒 سيتم إغلاق هذه التذكرة خلال 5 ثواني...');
      await interaction.reply({ embeds: [embed] });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  },
};
