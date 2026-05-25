const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('نظام تذاكر الدعم 🎫')
    .addSubcommand(sub =>
      sub.setName('setup').setDescription('إعداد نظام التذاكر في هذا الشانيل')
         .addRoleOption(opt => opt.setName('support_role').setDescription('رول الدعم').setRequired(true))
         .addRoleOption(opt => opt.setName('admin_role').setDescription('رول الإدارة').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('add').setDescription('إضافة عضو للتذكرة')
         .addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true))
    ),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // ─── Setup ────────────────────────────────────────────────────────────
    if (sub === 'setup') {
      const supportRole = interaction.options.getRole('support_role');
      const adminRole = interaction.options.getRole('admin_role');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎫 نظام التذاكر')
        .setDescription('اضغط الزر أدناه لفتح تذكرة دعم جديدة!\nسيتم إنشاء شانيل خاص بك مع فريق الدعم.')
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_open_${supportRole.id}_${adminRole.id}`)
          .setLabel('فتح تذكرة 🎫')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ تم إعداد نظام التذاكر!', ephemeral: true });
    }

    // ─── Add ─────────────────────────────────────────────────────────────
    if (sub === 'add') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ هذا الأمر يشتغل فقط في شانيل التذكرة!', ephemeral: true });
      }
      const user = interaction.options.getMember('user');
      await interaction.channel.permissionOverwrites.create(user, {
        ViewChannel: true, SendMessages: true
      });
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`✅ تم إضافة ${user} للتذكرة!`)]
      });
    }
  },
};
