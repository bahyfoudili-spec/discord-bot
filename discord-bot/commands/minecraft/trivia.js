const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ECONOMY_PATH = path.join(__dirname, '../../data/economy.json');
function loadEco() {
  if (!fs.existsSync(ECONOMY_PATH)) fs.writeFileSync(ECONOMY_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(ECONOMY_PATH, 'utf-8')); } catch { return {}; }
}
function saveEco(db) { fs.writeFileSync(ECONOMY_PATH, JSON.stringify(db, null, 2)); }

const QUESTIONS = [
  { q: 'كم عدد قلوب اللاعب الافتراضية في ماينكرافت؟', options: ['10', '20', '15', '8'], answer: 0, reward: 50 },
  { q: 'من أي مادة يصنع طاولة التعاويذ؟', options: ['الألماس والأوبسيديان والكتاب', 'الحجر والخشب', 'الحديد والزجاج', 'الذهب والكتاب'], answer: 0, reward: 80 },
  { q: 'أين تجد الإليترا؟', options: ['في الإندر سيتي', 'في قلعة النيذر', 'في الكهوف', 'في القرى'], answer: 0, reward: 100 },
  { q: 'ماذا يسقط الكريبر عند قتله بالسكيلتون؟', options: ['قرص موسيقى', 'بارود', 'غذاء', 'لا شيء'], answer: 0, reward: 120 },
  { q: 'كم عدد الكتل المطلوبة لتشغيل البيكون بالكامل (4 طبقات)؟', options: ['164', '100', '81', '50'], answer: 0, reward: 150 },
  { q: 'ما اسم تنين الإندر؟', options: ['Jean', 'Dragon', 'Ender King', 'Void'], answer: 0, reward: 60 },
  { q: 'من أي بُعد يأتي النيذرايت؟', options: ['النيذر', 'الإندر', 'العالم العادي', 'البُعد المظلم'], answer: 0, reward: 70 },
  { q: 'ما الجزرة الذهبية تستخدم لـ؟', options: ['تربية الخيول والشفاء', 'الطهي فقط', 'صنع الدروع', 'العلاج من السم'], answer: 0, reward: 80 },
];

// Shuffle options for each question
function prepareQuestion(q) {
  const opts = [...q.options];
  const correct = opts[q.answer];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  const newAnswer = opts.indexOf(correct);
  return { ...q, options: opts, answer: newAnswer };
}

const ACTIVE = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('🧠 اختبار معلومات ماينكرافت واكسب كوينز!'),
  cooldown: 30,

  async execute(interaction) {
    if (ACTIVE.has(interaction.user.id)) {
      return interaction.reply({ content: '⚠️ عندك سؤال بعده! أجب عليه أول.', ephemeral: true });
    }

    const raw = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    const q = prepareQuestion(raw);
    const emojis = ['🇦', '🇧', '🇨', '🇩'];

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🧠 سؤال ماينكرافت!')
      .setDescription(`**${q.q}**`)
      .addFields(q.options.map((o, i) => ({ name: `${emojis[i]} ${o}`, value: '\u200b', inline: true })))
      .setFooter({ text: `🪙 الجائزة: ${q.reward} كوين • عندك 20 ثانية` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      q.options.map((o, i) =>
        new ButtonBuilder().setCustomId(`trivia_${i}`).setLabel(`${emojis[i]} ${o}`).setStyle(ButtonStyle.Primary)
      )
    );

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    ACTIVE.set(interaction.user.id, { q, msgId: msg.id, reward: q.reward });

    const collector = msg.createMessageComponentCollector({ time: 20000, max: 1, filter: i => i.user.id === interaction.user.id });

    collector.on('collect', async (btnInt) => {
      ACTIVE.delete(interaction.user.id);
      const chosen = parseInt(btnInt.customId.split('_')[1]);
      const correct = chosen === q.answer;

      const eco = loadEco();
      if (!eco[interaction.user.id]) eco[interaction.user.id] = { balance: 0, lastDaily: 0, totalEarned: 0 };

      if (correct) {
        eco[interaction.user.id].balance += q.reward;
        eco[interaction.user.id].totalEarned += q.reward;
        saveEco(eco);
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(correct ? '#00FF7F' : '#FF0000')
        .setTitle(correct ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!')
        .setDescription(correct
          ? `مبروك! كسبت **${q.reward} 🪙 كوين**!`
          : `الإجابة الصحيحة كانت: **${q.options[q.answer]}**`
        )
        .setTimestamp();

      await btnInt.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        ACTIVE.delete(interaction.user.id);
        const timeEmbed = new EmbedBuilder()
          .setColor('#FF8C00')
          .setTitle('⏰ انتهى الوقت!')
          .setDescription(`الإجابة الصحيحة كانت: **${q.options[q.answer]}**`)
          .setTimestamp();
        msg.edit({ embeds: [timeEmbed], components: [] }).catch(() => {});
      }
    });
  },
};
