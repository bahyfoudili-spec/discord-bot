const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const words = [
  { word: 'ديسكورد', hint: 'تطبيق تواصل' },
  { word: 'برمجة', hint: 'كتابة كود' },
  { word: 'حاسوب', hint: 'جهاز إلكتروني' },
  { word: 'انترنت', hint: 'شبكة عالمية' },
  { word: 'لعبة', hint: 'ترفيه' },
  { word: 'سيرفر', hint: 'خادم' },
  { word: 'بوت', hint: 'برنامج تلقائي' },
  { word: 'كلمة', hint: 'وحدة لغوية' },
  { word: 'صوت', hint: 'ما تسمعه' },
  { word: 'مستخدم', hint: 'شخص يستخدم التطبيق' },
];

const activeGames = new Map();

function scramble(word) {
  return word.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wordgame')
    .setDescription('لعبة ترتيب الكلمات 📝')
    .addSubcommand(sub => sub.setName('start').setDescription('ابدأ لعبة جديدة'))
    .addSubcommand(sub =>
      sub.setName('answer').setDescription('أجب على السؤال')
         .addStringOption(opt => opt.setName('word').setDescription('إجابتك').setRequired(true))
    ),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const channelId = interaction.channel.id;

    if (sub === 'start') {
      const picked = words[Math.floor(Math.random() * words.length)];
      let scrambled = scramble(picked.word);
      while (scrambled === picked.word) scrambled = scramble(picked.word);

      activeGames.set(channelId, { word: picked.word, startTime: Date.now() });

      setTimeout(() => {
        if (activeGames.has(channelId)) {
          activeGames.delete(channelId);
          interaction.channel.send({
            embeds: [new EmbedBuilder().setColor('#FF0000')
              .setDescription(`⏰ انتهى الوقت! الكلمة كانت **${picked.word}**`)]
          }).catch(() => {});
        }
      }, 30000);

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#9B59B6')
          .setTitle('📝 رتّب الكلمة!')
          .addFields(
            { name: '🔀 الكلمة المبعثرة', value: `## ${scrambled}` },
            { name: '💡 تلميح', value: picked.hint },
            { name: '⏰ الوقت', value: '30 ثانية' }
          )
          .setFooter({ text: 'استخدم /wordgame answer للإجابة' })]
      });
    }

    if (sub === 'answer') {
      const game = activeGames.get(channelId);
      if (!game) return interaction.reply({ content: '❌ ما فيه لعبة نشطة! شغّل `/wordgame start`', ephemeral: true });

      const answer = interaction.options.getString('word').trim();
      const time = ((Date.now() - game.startTime) / 1000).toFixed(1);

      if (answer === game.word) {
        activeGames.delete(channelId);
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 صح!')
            .setDescription(`${interaction.user} خمّن الكلمة **${game.word}** في **${time}** ثانية! 🏆`)]
        });
      } else {
        await interaction.reply({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`❌ غلط! حاول مرة ثانية`)],
          ephemeral: true
        });
      }
    }
  },
};
