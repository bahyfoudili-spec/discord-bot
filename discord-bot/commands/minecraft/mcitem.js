const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const items = {
  'diamond': { name: 'ألماس', emoji: '💎', desc: 'معدن نادر يُستخدم لصنع أقوى الأدوات والدروع', rarity: 'نادر', type: 'معدن' },
  'sword': { name: 'سيف', emoji: '⚔️', desc: 'سلاح للقتال، يصنع من الخشب أو الحجر أو الحديد أو الذهب أو الألماس أو النيثيرايت', rarity: 'عادي', type: 'سلاح' },
  'creeper': { name: 'كريبر', emoji: '💥', desc: 'مخلوق أخضر خطير ينفجر عند الاقتراب منه، يدرب السيرفر!', rarity: 'عادي', type: 'عدو' },
  'enderdragon': { name: 'تنين الإندر', emoji: '🐉', desc: 'أخطر بوص في ماينكرافت، يعيش في بُعد الإندر', rarity: 'أسطوري', type: 'بوص' },
  'netherite': { name: 'نيثيرايت', emoji: '⬛', desc: 'أقوى معدن في اللعبة، يُصنع من نقام وقرصات الذهب', rarity: 'نادر جداً', type: 'معدن' },
  'enchanting': { name: 'طاولة التعاويذ', emoji: '📖', desc: 'تُستخدم لإضافة تعاويذ للأدوات والدروع مقابل نقاط الخبرة', rarity: 'عادي', type: 'بلوك' },
  'elytra': { name: 'إليترا', emoji: '🪂', desc: 'أجنحة نادرة تتيح لك الطيران، تُوجد في سفن المدن الإندر', rarity: 'نادر جداً', type: 'درع' },
  'totem': { name: 'تميمة الخلود', emoji: '🗿', desc: 'تحميك من الموت مرة واحدة، تحملها في يدك', rarity: 'نادر', type: 'أداة' },
  'beacon': { name: 'بيكون', emoji: '🔆', desc: 'يعطيك قوى خاصة كالسرعة والقوة، يحتاج هرم من المعادن', rarity: 'نادر', type: 'بلوك' },
  'wither': { name: 'ويثر', emoji: '💀', desc: 'بوص تصنعه بنفسك من رؤوس الجمجمة والروح سند، خطير جداً!', rarity: 'أسطوري', type: 'بوص' },
};

const rarityColors = {
  'عادي': '#AAAAAA',
  'نادر': '#5555FF',
  'نادر جداً': '#AA00AA',
  'أسطوري': '#FFAA00',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcitem')
    .setDescription('📖 معلومات عن أي شيء في ماينكرافت')
    .addStringOption(opt =>
      opt.setName('item')
        .setDescription('اسم الشيء')
        .setRequired(true)
        .addChoices(
          { name: '💎 ألماس', value: 'diamond' },
          { name: '⚔️ سيف', value: 'sword' },
          { name: '💥 كريبر', value: 'creeper' },
          { name: '🐉 تنين الإندر', value: 'enderdragon' },
          { name: '⬛ نيثيرايت', value: 'netherite' },
          { name: '📖 طاولة التعاويذ', value: 'enchanting' },
          { name: '🪂 إليترا', value: 'elytra' },
          { name: '🗿 تميمة الخلود', value: 'totem' },
          { name: '🔆 بيكون', value: 'beacon' },
          { name: '💀 ويثر', value: 'wither' },
        )
    ),
  cooldown: 3,

  async execute(interaction) {
    const key = interaction.options.getString('item');
    const item = items[key];

    if (!item) return interaction.reply({ content: '❌ ما لقيت هذا الشيء!', ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(rarityColors[item.rarity] || '#5865F2')
      .setTitle(`${item.emoji} ${item.name}`)
      .setDescription(item.desc)
      .addFields(
        { name: '✨ الندرة', value: item.rarity, inline: true },
        { name: '📦 النوع', value: item.type, inline: true },
        { name: '🔗 ويكي', value: `[Minecraft Wiki](https://minecraft.wiki/w/${key})`, inline: true },
      )
      .setFooter({ text: 'Minecraft Wiki', iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
