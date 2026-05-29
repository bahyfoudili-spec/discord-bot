const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/suggestions.json');
const CONFIG_PATH = path.join(__dirname, '../../data/suggestions_config.json');

function load(p) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, '{}');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; }
}
function save(p, db) { fs.writeFileSync(p, JSON.stringify(db, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('💡 نظام الاقتراحات')
    .addSubcommand(sub =>
      sub.setName('send').setDescription('أرسل اقتراح')
        .addStringOption(o => o.setName('idea').setDescription('اقتراحك').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('setup').setDescription('إعداد شانيل الاقتراحات')
        .addChannelOption(o => o.setName('channel').setDescription('الشانيل').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('approve').setDescription('✅ قبول اقتراح')
        .addStringOption(o => o.setName('message_id').setDescription('ID الرسالة').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('deny').setDescription('❌ رفض اقتراح')
        .addStringOption(o => o.setName('message_id').setDescription('ID الرسالة').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false))
    ),
  cooldown: 10,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = load(CONFIG_PATH);
    const db = load(DB_PATH);

    if (sub === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: '❌ صلاحيات غير كافية!', ephemeral: true });
      const channel = interaction.options.getChannel('channel');
      config[interaction.guild.id] = { channelId: channel.id };
      save(CONFIG_PATH, config);
      return interaction.reply({ content: `✅ شانيل الاقتراحات: ${channel}`, ephemeral: true });
    }

    if (sub === 'send') {
      const gConfig = config[interaction.guild.id];
      if (!gConfig) return interaction.reply({ content: '❌ لم يُعَد إعداد شانيل الاقتراحات بعد! استخدم `/suggest setup`', ephemeral: true });

      const idea = interaction.options.getString('idea');
      const channel = await interaction.client.channels.fetch(gConfig.channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: '❌ ما لقيت شانيل الاقتراحات!', ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('💡 اقتراح جديد')
        .setDescription(idea)
        .addFields(
          { name: '👤 المقترح', value: `${interaction.user.tag}`, inline: true },
          { name: '📊 الحالة', value: '⏳ قيد المراجعة', inline: true },
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('suggest_up').setEmoji('👍').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('suggest_down').setEmoji('👎').setStyle(ButtonStyle.Danger),
      );

      const msg = await channel.send({ embeds: [embed], components: [row] });
      db[msg.id] = { idea, userId: interaction.user.id, upvotes: [], downvotes: [] };
      save(DB_PATH, db);

      return interaction.reply({ content: '✅ تم إرسال اقتراحك!', ephemeral: true });
    }

    if (sub === 'approve' || sub === 'deny') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: '❌ صلاحيات غير كافية!', ephemeral: true });

      const msgId = interaction.options.getString('message_id');
      const reason = interaction.options.getString('reason') ?? 'بدون سبب';
      const gConfig = config[interaction.guild.id];
      if (!gConfig) return interaction.reply({ content: '❌ لم يُعَد إعداد الاقتراحات!', ephemeral: true });

      const channel = await interaction.client.channels.fetch(gConfig.channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: '❌ ما لقيت الشانيل!', ephemeral: true });

      const message = await channel.messages.fetch(msgId).catch(() => null);
      if (!message) return interaction.reply({ content: '❌ ما لقيت الرسالة!', ephemeral: true });

      const isApprove = sub === 'approve';
      const oldEmbed = message.embeds[0];
      const newEmbed = EmbedBuilder.from(oldEmbed)
        .setColor(isApprove ? '#00FF7F' : '#FF0000')
        .spliceFields(1, 1, { name: '📊 الحالة', value: isApprove ? `✅ مقبول` : `❌ مرفوض`, inline: true })
        .addFields({ name: isApprove ? '✅ السبب' : '❌ سبب الرفض', value: reason, inline: false });

      await message.edit({ embeds: [newEmbed], components: [] });
      return interaction.reply({ content: `✅ تم ${isApprove ? 'قبول' : 'رفض'} الاقتراح!`, ephemeral: true });
    }
  },
};
