const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/economy.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return {}; }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getUser(db, userId) {
  if (!db[userId]) db[userId] = { balance: 0, lastDaily: 0, totalEarned: 0 };
  return db[userId];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('💰 نظام الاقتصاد')
    .addSubcommand(sub => sub.setName('balance').setDescription('شوف رصيدك أو رصيد شخص').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(false)))
    .addSubcommand(sub => sub.setName('daily').setDescription('خذ مكافأتك اليومية 🎁'))
    .addSubcommand(sub => sub.setName('pay').setDescription('حول كوينز لشخص ثاني').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)).addIntegerOption(o => o.setName('amount').setDescription('المبلغ').setMinValue(1).setRequired(true)))
    .addSubcommand(sub => sub.setName('top').setDescription('🏆 أغنى 10 أشخاص في السيرفر')),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = loadDB();

    // ─── Balance ─────────────────────────────────────────────
    if (sub === 'balance') {
      const target = interaction.options.getUser('user') || interaction.user;
      const user = getUser(db, target.id);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`💰 رصيد ${target.username}`)
        .addFields(
          { name: '🪙 الرصيد الحالي', value: `**${user.balance.toLocaleString()}** كوين`, inline: true },
          { name: '📈 إجمالي المكتسب', value: `**${user.totalEarned.toLocaleString()}** كوين`, inline: true },
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // ─── Daily ───────────────────────────────────────────────
    if (sub === 'daily') {
      const user = getUser(db, interaction.user.id);
      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000;
      const diff = now - user.lastDaily;

      if (diff < cooldown) {
        const remaining = cooldown - diff;
        const hrs = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({ content: `⏰ المكافأة اليومية بعد **${hrs}س ${mins}د**!`, ephemeral: true });
      }

      const reward = Math.floor(Math.random() * 300) + 200; // 200-500 coins
      user.balance += reward;
      user.totalEarned += reward;
      user.lastDaily = now;
      saveDB(db);

      const embed = new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle('🎁 مكافأتك اليومية!')
        .setDescription(`حصلت على **${reward} كوين** 🪙\nرصيدك الجديد: **${user.balance.toLocaleString()} كوين**`)
        .setFooter({ text: 'تقدر ترجع بكره!' })
        .setTimestamp();
      saveDB(db);
      return interaction.reply({ embeds: [embed] });
    }

    // ─── Pay ────────────────────────────────────────────────
    if (sub === 'pay') {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      if (target.id === interaction.user.id) return interaction.reply({ content: '❌ ما تقدر تحول لنفسك!', ephemeral: true });
      if (target.bot) return interaction.reply({ content: '❌ ما تقدر تحول للبوتات!', ephemeral: true });

      const sender = getUser(db, interaction.user.id);
      if (sender.balance < amount) return interaction.reply({ content: `❌ ما عندك كافي! رصيدك: **${sender.balance} كوين**`, ephemeral: true });

      const receiver = getUser(db, target.id);
      sender.balance -= amount;
      receiver.balance += amount;
      receiver.totalEarned += amount;
      saveDB(db);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('💸 تحويل ناجح!')
        .addFields(
          { name: '📤 من', value: interaction.user.tag, inline: true },
          { name: '📥 إلى', value: target.tag, inline: true },
          { name: '🪙 المبلغ', value: `${amount.toLocaleString()} كوين`, inline: true },
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // ─── Top ────────────────────────────────────────────────
    if (sub === 'top') {
      const sorted = Object.entries(db)
        .sort(([, a], [, b]) => b.balance - a.balance)
        .slice(0, 10);

      if (sorted.length === 0) return interaction.reply({ content: '📭 ما في أحد عنده كوينز بعد!', ephemeral: true });

      const medals = ['🥇', '🥈', '🥉'];
      const lines = await Promise.all(sorted.map(async ([id, data], i) => {
        let name = id;
        try { const u = await interaction.client.users.fetch(id); name = u.username; } catch {}
        return `${medals[i] || `**${i + 1}.**`} ${name} — **${data.balance.toLocaleString()} كوين**`;
      }));

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 أغنى اللاعبين')
        .setDescription(lines.join('\n'))
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  },
};
