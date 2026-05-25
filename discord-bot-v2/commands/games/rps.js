const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const choices = ['✊ حجر', '✋ ورقة', '✌️ مقص'];
const wins = {
  '✊ حجر': '✌️ مقص',
  '✋ ورقة': '✊ حجر',
  '✌️ مقص': '✋ ورقة',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('حجر ورقة مقص مع البوت!')
    .addStringOption(opt =>
      opt.setName('choice')
        .setDescription('اختيارك')
        .setRequired(true)
        .addChoices(
          { name: '✊ حجر', value: '✊ حجر' },
          { name: '✋ ورقة', value: '✋ ورقة' },
          { name: '✌️ مقص', value: '✌️ مقص' }
        )
    ),
  cooldown: 2,

  async execute(interaction) {
    const userChoice = interaction.options.getString('choice');
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result, color;
    if (userChoice === botChoice) {
      result = '🤝 تعادل!';
      color = '#808080';
    } else if (wins[userChoice] === botChoice) {
      result = '🎉 أنت فزت!';
      color = '#00FF00';
    } else {
      result = '😈 البوت فاز!';
      color = '#FF0000';
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('✊✋✌️ حجر ورقة مقص')
      .addFields(
        { name: 'اختيارك', value: userChoice, inline: true },
        { name: 'اختيار البوت', value: botChoice, inline: true },
        { name: 'النتيجة', value: result, inline: false }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
