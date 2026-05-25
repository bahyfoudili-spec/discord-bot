const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const memes = [
  'https://i.imgur.com/TGlJHkm.png',
  'https://i.imgur.com/6BdtNAL.png',
  'https://i.imgur.com/Vk3tb1x.png',
];

const cats = [
  'https://cataas.com/cat',
  'https://cataas.com/cat/cute',
  'https://cataas.com/cat/funny',
];

const dogs = [
  'https://random.dog/woof.jpg',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('صور وميمز 🖼️')
    .addSubcommand(sub => sub.setName('meme').setDescription('ميم عشوائي 😂'))
    .addSubcommand(sub => sub.setName('cat').setDescription('صورة قطة 🐱'))
    .addSubcommand(sub => sub.setName('dog').setDescription('صورة كلب 🐶'))
    .addSubcommand(sub =>
      sub.setName('avatar').setDescription('صورة بروفايل كبيرة')
         .addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(false))
    ),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply();

    if (sub === 'meme') {
      // Fetch from meme API
      try {
        const res = await fetch('https://meme-api.com/gimme');
        const data = await res.json();
        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle(data.title || '😂 ميم عشوائي')
          .setImage(data.url)
          .setFooter({ text: `👍 ${data.ups} | r/${data.subreddit}` });
        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply({ content: '❌ ما قدرت أجيب ميم الحين، جرب مرة ثانية!' });
      }
    }

    if (sub === 'cat') {
      try {
        const res = await fetch('https://api.thecatapi.com/v1/images/search');
        const data = await res.json();
        const embed = new EmbedBuilder()
          .setColor('#FF9999')
          .setTitle('🐱 قطة عشوائية!')
          .setImage(data[0].url);
        await interaction.editReply({ embeds: [embed] });
      } catch {
        const embed = new EmbedBuilder().setColor('#FF9999').setTitle('🐱 قطة!').setImage(cats[0]);
        await interaction.editReply({ embeds: [embed] });
      }
    }

    if (sub === 'dog') {
      try {
        const res = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await res.json();
        const embed = new EmbedBuilder()
          .setColor('#8B4513')
          .setTitle('🐶 كلب عشوائي!')
          .setImage(data.message);
        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply({ content: '❌ ما قدرت أجيب صورة!' });
      }
    }

    if (sub === 'avatar') {
      const user = interaction.options.getUser('user') ?? interaction.user;
      const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🖼️ صورة ${user.username}`)
        .setImage(avatar)
        .addFields({ name: '🔗 رابط', value: `[اضغط هنا](${avatar})` });
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
