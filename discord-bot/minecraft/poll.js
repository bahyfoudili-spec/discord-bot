const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/polls.json');
function loadDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return {}; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('📊 أنشئ تصويت')
    .addStringOption(o => o.setName('question').setDescription('السؤال').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('الخيار الأول').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('الخيار الثاني').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('الخيار الثالث').setRequired(false))
    .addStringOption(o => o.setName('option4').setDescription('الخيار الرابع').setRequired(false)),
  cooldown: 10,

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(Boolean);

    const description = options.map((o, i) => `${EMOJIS[i]} **${o}**\n▱▱▱▱▱▱▱▱▱▱ 0%`).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 ${question}`)
      .setDescription(description)
      .setFooter({ text: `أنشأه: ${interaction.user.tag} • 0 تصويت` })
      .setTimestamp();

    const rows = [];
    const buttons = options.map((o, i) =>
      new ButtonBuilder().setCustomId(`poll_vote_${i}`).setLabel(o.slice(0, 80)).setEmoji(EMOJIS[i]).setStyle(ButtonStyle.Secondary)
    );
    // Max 5 per row
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
    }

    const msg = await interaction.reply({ embeds: [embed], components: rows, fetchReply: true });

    const db = loadDB();
    db[msg.id] = { question, options, votes: options.map(() => []), total: 0 };
    saveDB(db);
  },
};
