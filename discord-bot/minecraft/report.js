const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../data/report_config.json');
function load(p) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, '{}');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; }
}
function save(p, db) { fs.writeFileSync(p, JSON.stringify(db, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('🚨 نظام البلاغات')
    .addSubcommand(sub =>
      sub.setName('setup').setDescription('إعداد شانيل البلاغات')
        .addChannelOption(o => o.setName('channel').setDescription('الشانيل').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('user').setDescription('بلّغ عن عضو')
        .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(true))
        .addStringOption(o => o.setName('proof').setDescription('دليل (رابط صورة)').setRequired(false))
    ),
  cooldown: 30,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = load(CONFIG_PATH);

    if (sub === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: '❌ صلاحيات غير كافية!', ephemeral: true });
      const channel = interaction.options.getChannel('channel');
      config[interaction.guild.id] = { channelId: channel.id };
      save(CONFIG_PATH, config);
      return interaction.reply({ content: `✅ شانيل البلاغات: ${channel}`, ephemeral: true });
    }

    if (sub === 'user') {
      const gConfig = config[interaction.guild.id];
      if (!gConfig) return interaction.reply({ content: '❌ لم يُعَد إعداد البلاغات! استخدم `/report setup`', ephemeral: true });

      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const proof = interaction.options.getString('proof');

      if (target.id === interaction.user.id) return interaction.reply({ content: '❌ ما تقدر تبلغ عن نفسك!', ephemeral: true });
      if (target.bot) return interaction.reply({ content: '❌ ما تقدر تبلغ عن بوت!', ephemeral: true });

      const channel = await interaction.client.channels.fetch(gConfig.channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: '❌ ما لقيت شانيل البلاغات!', ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚨 بلاغ جديد')
        .addFields(
          { name: '🎯 المُبلَّغ عنه', value: `${target.tag} (${target.id})`, inline: true },
          { name: '📝 المُبلِّغ', value: `${interaction.user.tag}`, inline: true },
          { name: '⚠️ السبب', value: reason, inline: false },
          { name: '📍 القناة', value: `${interaction.channel}`, inline: true },
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      if (proof) embed.setImage(proof);

      await channel.send({ embeds: [embed] });
      return interaction.reply({ content: '✅ تم إرسال بلاغك للإدارة!', ephemeral: true });
    }
  },
};
