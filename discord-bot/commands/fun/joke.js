const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jokes = [
  'ليش الكمبيوتر حار؟ لأنه فتح كثير windows! 😂',
  'قالوا له: أنت كسول! قال: والله ما راح أرد عليكم 😴',
  'الدكتور قال له: ما تنام كافي. قال: أعرف، كل ما أنام أصحى! 😅',
  'سألوه: شو عندك بالغدا؟ قال: الله يرزق 🤲',
  'ليش البرمجة زي الحب؟ لأن في اول الموضوع كل شي حلو، وبعدين تبدأ الـ bugs 🐛',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('نكتة عشوائية تضحك 😂'),
  cooldown: 3,

  async execute(interaction) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('😂 نكتة اليوم')
      .setDescription(joke)
      .setFooter({ text: `طلب من ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
  },
};
