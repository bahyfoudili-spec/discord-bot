const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
 
const statsPath = path.join(__dirname, '../data/ticketstats.json');
 
function loadStats() {
  if (!fs.existsSync(statsPath)) {
    fs.mkdirSync(path.dirname(statsPath), { recursive: true });
    fs.writeFileSync(statsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
}
 
function saveStats(data) {
  fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
}
 
function trackStat(guildId, type, staffId = null) {
  const data = loadStats();
  if (!data[guildId]) data[guildId] = { total: 0, claimed: 0, closed: 0, staff: {} };
  if (type === 'total') data[guildId].total++;
  if (type === 'claimed') {
    data[guildId].claimed++;
    if (staffId) {
      data[guildId].staff[staffId] = (data[guildId].staff[staffId] || 0) + 1;
    }
  }
  if (type === 'closed') data[guildId].closed++;
  saveStats(data);
}
 
module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;
 
    // ─── فتح تذكرة جديدة ─────────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId.startsWith('ticket_open_')) {
      const parts = interaction.customId.replace('ticket_open_', '').split('_');
      const supportRoleId = parts[0];
      const adminRoleId = parts[1] || parts[0];
      const guild = interaction.guild;
      const user = interaction.user;
 
      const existing = guild.channels.cache.find(ch => ch.topic === `ticket-${user.id}`);
      if (existing) {
        return interaction.reply({ content: `❌ عندك تذكرة مفتوحة! ${existing}`, ephemeral: true });
      }
 
      const ticketChannel = await guild.channels.create({
        name: `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`,
        type: ChannelType.GuildText,
        topic: `ticket-${user.id}`,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: adminRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });
 
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎫 تذكرة جديدة')
        .setDescription(`مرحباً ${user}!\nفريق الدعم سيرد عليك قريباً.\nاشرح مشكلتك وانتظر! 😊`)
        .addFields(
          { name: '👤 صاحب التذكرة', value: `${user}`, inline: true },
          { name: '📅 التاريخ', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true }
        )
        .setFooter({ text: `ID: ${user.id}` })
        .setTimestamp();
 
      // الأزرار - صف أول
      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_claim_${supportRoleId}_${adminRoleId}`)
          .setLabel('✅ استلام')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('ticket_rename')
          .setLabel('✏️ تغيير الاسم')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`ticket_ping_owner`)
          .setLabel('📣 مناداة صاحب السيرفر')
          .setStyle(ButtonStyle.Secondary),
      );
 
      // الأزرار - صف ثاني
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_ping_admin_${adminRoleId}`)
          .setLabel('🔔 مناداة الإدارة')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ticket_close_btn')
          .setLabel('🔒 إغلاق التذكرة')
          .setStyle(ButtonStyle.Danger),
      );
 
      await ticketChannel.send({
        content: `${user} <@&${supportRoleId}>`,
        embeds: [embed],
        components: [row1, row2]
      });
 
      trackStat(interaction.guild.id, 'total');
      await interaction.reply({ content: `✅ تم إنشاء تذكرتك! ${ticketChannel}`, ephemeral: true });
      return;
    }
 
    // ─── استلام التذكرة ───────────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId.startsWith('ticket_claim_')) {
      const parts = interaction.customId.replace('ticket_claim_', '').split('_');
      const supportRoleId = parts[0];
      const adminRoleId = parts[1] || parts[0];
      const member = interaction.member;
 
      // تحقق إن الشخص عنده رول الدعم أو الإدارة
      const hasRole = member.roles.cache.has(supportRoleId) || member.roles.cache.has(adminRoleId) || member.permissions.has(PermissionFlagsBits.Administrator);
      if (!hasRole) {
        return interaction.reply({ content: '❌ فقط فريق الدعم يقدر يستلم التذكرة!', ephemeral: true });
      }
 
      // امنع الكل من الكتابة عدا المستلم وصاحب التذكرة
      const ticketOwnerId = interaction.channel.topic?.replace('ticket-', '');
      
      await interaction.channel.permissionOverwrites.set([
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: ticketOwnerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] },
        { id: adminRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ]);
 
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setDescription(`✅ تم استلام التذكرة من قبل ${member}\nفقط ${member} و صاحب التذكرة يقدرون يكتبون الآن.`);
 
      trackStat(interaction.guild.id, 'claimed', member.id);
      await interaction.reply({ embeds: [embed] });
      return;
    }
 
    // ─── تغيير اسم التذكرة ───────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'ticket_rename') {
      const modal = new ModalBuilder()
        .setCustomId('ticket_rename_modal')
        .setTitle('✏️ تغيير اسم التذكرة');
 
      const input = new TextInputBuilder()
        .setCustomId('new_name')
        .setLabel('الاسم الجديد')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('ticket-مشكلتي')
        .setMaxLength(50)
        .setRequired(true);
 
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
      return;
    }
 
    // ─── استقبال اسم التذكرة الجديد ──────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === 'ticket_rename_modal') {
      const newName = interaction.fields.getTextInputValue('new_name')
        .toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\-]/g, '-').slice(0, 50);
      
      await interaction.channel.setName(`ticket-${newName}`);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`✅ تم تغيير اسم التذكرة لـ **ticket-${newName}**`)]
      });
      return;
    }
 
    // ─── مناداة صاحب السيرفر ─────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'ticket_ping_owner') {
      const owner = await interaction.guild.fetchOwner();
      await interaction.reply({
        content: `${owner} 👑 تم مناداتك في تذكرة دعم!`,
      });
      return;
    }
 
    // ─── مناداة الإدارة ───────────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId.startsWith('ticket_ping_admin_')) {
      const adminRoleId = interaction.customId.replace('ticket_ping_admin_', '');
      await interaction.reply({
        content: `<@&${adminRoleId}> 🔔 مطلوب في تذكرة دعم!`,
      });
      return;
    }
 
    // ─── إغلاق التذكرة ───────────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'ticket_close_btn') {
      await interaction.deferReply();
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('🔒 سيتم إغلاق هذه التذكرة خلال 5 ثواني...');
      await interaction.editReply({ embeds: [embed] });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      return;
    }
  },
};
