const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/giveaways.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return {}; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 نظام السحوبات')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('start').setDescription('ابدأ سحب جديد')
        .addStringOption(o => o.setName('prize').setDescription('الجائزة').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('المدة بالدقائق').setMinValue(1).setMaxValue(10080).setRequired(true))
        .addIntegerOption(o => o.setName('winners').setDescription('عدد الفائزين').setMinValue(1).setMaxValue(10).setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('end').setDescription('أنهِ سحب مبكراً')
        .addStringOption(o => o.setName('message_id').setDescription('ID رسالة السحب').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reroll').setDescription('أعد السحب')
        .addStringOption(o => o.setName('message_id').setDescription('ID رسالة السحب').setRequired(true))
    ),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const minutes = interaction.options.getInteger('minutes');
      const winnersCount = interaction.options.getInteger('winners') ?? 1;
      const endsAt = Date.now() + minutes * 60000;

      const embed = new EmbedBuilder()
        .setColor('#FF73FA')
        .setTitle('🎉 سحب جديد!')
        .setDescription(`**الجائزة:** ${prize}\n\n🕐 ينتهي: <t:${Math.floor(endsAt / 1000)}:R>\n👑 عدد الفائزين: **${winnersCount}**\n\nاضغط 🎉 للمشاركة!`)
        .setFooter({ text: `بدأه: ${interaction.user.tag}` })
        .setTimestamp(new Date(endsAt));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_join').setLabel('🎉 شارك').setStyle(ButtonStyle.Primary)
      );

      const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

      const db = loadDB();
      db[msg.id] = { prize, endsAt, winnersCount, participants: [], channelId: interaction.channel.id, guildId: interaction.guild.id, ended: false };
      saveDB(db);

      await interaction.reply({ content: `✅ تم إنشاء السحب! [اضغط هنا](${msg.url})`, ephemeral: true });

      // Auto-end timer
      setTimeout(async () => {
        try {
          const db2 = loadDB();
          const gw = db2[msg.id];
          if (!gw || gw.ended) return;
          gw.ended = true;

          const channel = await interaction.client.channels.fetch(gw.channelId);
          const message = await channel.messages.fetch(msg.id);

          if (!gw.participants.length) {
            const endEmbed = new EmbedBuilder().setColor('#FF0000').setTitle('🎉 انتهى السحب').setDescription(`**الجائزة:** ${gw.prize}\n\n❌ ما في أحد شارك!`).setTimestamp();
            await message.edit({ embeds: [endEmbed], components: [] });
            saveDB(db2);
            return;
          }

          const shuffled = [...gw.participants].sort(() => Math.random() - 0.5);
          const winners = shuffled.slice(0, gw.winnersCount);
          const winnersMention = winners.map(id => `<@${id}>`).join(', ');

          const endEmbed = new EmbedBuilder().setColor('#FFD700').setTitle('🎊 انتهى السحب!').setDescription(`**الجائزة:** ${gw.prize}\n\n🏆 الفائزون: ${winnersMention}\n\nمبروك! 🎉`).setTimestamp();
          await message.edit({ embeds: [endEmbed], components: [] });
          await channel.send({ content: `🎊 مبروك ${winnersMention}! فزتم بـ **${gw.prize}**!` });
          saveDB(db2);
        } catch (e) { console.error('Giveaway end error:', e); }
      }, minutes * 60000);
    }

    if (sub === 'end' || sub === 'reroll') {
      const msgId = interaction.options.getString('message_id');
      const db = loadDB();
      const gw = db[msgId];
      if (!gw) return interaction.reply({ content: '❌ ما لقيت هذا السحب!', ephemeral: true });
      if (!gw.participants.length) return interaction.reply({ content: '❌ ما في مشاركين!', ephemeral: true });

      const shuffled = [...gw.participants].sort(() => Math.random() - 0.5);
      const winners = shuffled.slice(0, gw.winnersCount);
      const winnersMention = winners.map(id => `<@${id}>`).join(', ');

      gw.ended = true;
      saveDB(db);

      await interaction.reply({ content: `🎊 الفائزون: ${winnersMention}` });
    }
  },
};
