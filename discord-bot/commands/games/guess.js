const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guess')
    .setDescription('لعبة تخمين الرقم 🔢')
    .addSubcommand(sub =>
      sub.setName('start').setDescription('ابدأ لعبة جديدة')
         .addIntegerOption(opt => opt.setName('max').setDescription('أكبر رقم (افتراضي 100)').setMinValue(10).setMaxValue(1000))
    )
    .addSubcommand(sub =>
      sub.setName('try').setDescription('جرب رقم')
         .addIntegerOption(opt => opt.setName('number').setDescription('رقمك').setRequired(true))
    ),
  cooldown: 2,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === 'start') {
      const max = interaction.options.getInteger('max') ?? 100;
      const secret = Math.floor(Math.random() * max) + 1;
      activeGames.set(userId, { secret, max, attempts: 0, startTime: Date.now() });

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🔢 لعبة تخمين الرقم')
          .setDescription(`فكرت برقم بين **1** و **${max}**!\nاستخدم \`/guess try\` وحاول تخمنه! 🎯`)]
      });
    }

    if (sub === 'try') {
      const game = activeGames.get(userId);
      if (!game) return interaction.reply({ content: '❌ ما عندك لعبة نشطة! شغّل `/guess start`', ephemeral: true });

      const guess = interaction.options.getInteger('number');
      game.attempts++;

      if (guess === game.secret) {
        const time = ((Date.now() - game.startTime) / 1000).toFixed(1);
        activeGames.delete(userId);
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 صح!')
            .setDescription(`الرقم كان **${game.secret}**!\nخمّنت في **${game.attempts}** محاولة خلال **${time}** ثانية! 🏆`)]
        });
      }

      const hint = guess < game.secret ? '📈 الرقم أكبر!' : '📉 الرقم أصغر!';
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FFA500')
          .setDescription(`❌ غلط! ${hint}\nالمحاولة رقم: **${game.attempts}**`)]
      });
    }
  },
};
