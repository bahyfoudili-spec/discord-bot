const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/economy.json');
function load() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return {}; }
}
function save(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

const MC_JOBS = [
  { job: 'حفرت معادن في منجم', emoji: '⛏️', min: 50, max: 150 },
  { job: 'بنيت بيت للقرية', emoji: '🏠', min: 80, max: 200 },
  { job: 'قتلت وحوش في الليل', emoji: '⚔️', min: 60, max: 180 },
  { job: 'زرعت وحصدت المزرعة', emoji: '🌾', min: 40, max: 120 },
  { job: 'صنعت أدوات للبيع', emoji: '🔨', min: 70, max: 160 },
  { job: 'استكشفت كهفاً مظلماً', emoji: '🕯️', min: 90, max: 220 },
  { job: 'صادت أسماك في البحيرة', emoji: '🎣', min: 30, max: 100 },
  { job: 'جمعت موارد من الغابة', emoji: '🌲', min: 50, max: 130 },
  { job: 'أوصلت بضاعة للتجار', emoji: '📦', min: 60, max: 170 },
  { job: 'حاربت تنيناً في الإندر', emoji: '🐉', min: 150, max: 350 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('⛏️ اشتغل واكسب كوينز'),
  cooldown: 3600, // 1 hour

  async execute(interaction) {
    const db = load();
    if (!db[interaction.user.id]) db[interaction.user.id] = { balance: 0, lastDaily: 0, totalEarned: 0, lastWork: 0 };
    const user = db[interaction.user.id];

    const now = Date.now();
    const workCooldown = 3600000; // 1 hour
    if (user.lastWork && now - user.lastWork < workCooldown) {
      const remaining = workCooldown - (now - user.lastWork);
      const mins = Math.floor(remaining / 60000);
      return interaction.reply({ content: `⏰ تعبت! ارتاح **${mins} دقيقة** ثم ارجع للشغل.`, ephemeral: true });
    }

    const jobData = MC_JOBS[Math.floor(Math.random() * MC_JOBS.length)];
    const earned = Math.floor(Math.random() * (jobData.max - jobData.min + 1)) + jobData.min;

    user.balance += earned;
    user.totalEarned = (user.totalEarned || 0) + earned;
    user.lastWork = now;
    save(db);

    const embed = new EmbedBuilder()
      .setColor('#00CED1')
      .setTitle(`${jobData.emoji} شغلت!`)
      .setDescription(`**${jobData.job}**\nكسبت **${earned} 🪙 كوين**!`)
      .addFields({ name: '💰 رصيدك الجديد', value: `**${user.balance.toLocaleString()} كوين**`, inline: true })
      .setFooter({ text: 'تقدر تشتغل مرة ثانية بعد ساعة' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
