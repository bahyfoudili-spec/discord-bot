const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('ارمي نرد 🎲')
    .addIntegerOption(opt =>
      opt.setName('sides').setDescription('عدد الوجوه (افتراضي: 6)').setMinValue(2).setMaxValue(1000).setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('count').setDescription('عدد النرد (افتراضي: 1)').setMinValue(1).setMaxValue(10).setRequired(false)
    ),
  cooldown: 2,

  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') ?? 6;
    const count = interaction.options.getInteger('count') ?? 1;

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
      .setColor('#8B4513')
      .setTitle('🎲 رمي النرد')
      .addFields(
        { name: 'النتائج', value: rolls.map(r => `\`${r}\``).join(', '), inline: false },
        { name: 'المجموع', value: `**${total}**`, inline: true },
        { name: 'النرد', value: `${count}d${sides}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
