const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
  { text: '✅ نعم بالتأكيد!', color: '#00FF00' },
  { text: '✅ إيه والله', color: '#00FF00' },
  { text: '✅ الأمارات تقول نعم', color: '#00FF00' },
  { text: '⚠️ ممكن، مو متأكد', color: '#FFA500' },
  { text: '⚠️ اسأل مرة ثانية لاحقاً', color: '#FFA500' },
  { text: '⚠️ ما أقدر أجاوب الحين', color: '#FFA500' },
  { text: '❌ لا على الإطلاق', color: '#FF0000' },
  { text: '❌ ما أشوف ذا صاير', color: '#FF0000' },
  { text: '❌ الجواب لا', color: '#FF0000' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('اسأل الكرة السحرية 🎱')
    .addStringOption(opt =>
      opt.setName('question').setDescription('سؤالك').setRequired(true)
    ),
  cooldown: 3,

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(response.color)
      .setTitle('🎱 الكرة السحرية')
      .addFields(
        { name: '❓ سؤالك', value: question },
        { name: '🔮 الجواب', value: response.text }
      )
      .setFooter({ text: `سأل ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
  },
};
