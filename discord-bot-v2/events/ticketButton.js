const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('ticket_open_')) return;

    const supportRoleId = interaction.customId.replace('ticket_open_', '');
    const guild = interaction.guild;
    const user = interaction.user;

    // Check if user already has a ticket
    const existing = guild.channels.cache.find(
      ch => ch.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` ||
            ch.topic === `ticket-${user.id}`
    );

    if (existing) {
      return interaction.reply({
        content: `❌ عندك تذكرة مفتوحة بالفعل! ${existing}`,
        ephemeral: true
      });
    }

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`,
      type: ChannelType.GuildText,
      topic: `ticket-${user.id}`,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 تذكرة جديدة')
      .setDescription(`مرحباً ${user}!\nفريق الدعم سيرد عليك قريباً.\nاشرح مشكلتك وانتظر! 😊`)
      .setFooter({ text: 'لإغلاق التذكرة: /ticket close' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_close_btn')
        .setLabel('إغلاق التذكرة 🔒')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({ content: `${user} <@&${supportRoleId}>`, embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ تم إنشاء تذكرتك! ${ticketChannel}`, ephemeral: true });
  },
};
