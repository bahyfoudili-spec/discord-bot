const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const https = require('https');

function fetchServerStatus(ip) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mcsrvstat.us/2/${encodeURIComponent(ip)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('فشل تحليل البيانات')); }
      });
    }).on('error', reject);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('🟢 تحقق من حالة سيرفر ماينكرافت')
    .addStringOption(opt =>
      opt.setName('ip').setDescription('IP السيرفر (اتركه فاضي للسيرفر الافتراضي)').setRequired(false)
    ),
  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();
    const ip = interaction.options.getString('ip') || process.env.MC_SERVER_IP || 'play.example.com';

    try {
      const data = await fetchServerStatus(ip);

      if (!data.online) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🔴 السيرفر أوفلاين')
          .setDescription(`**${ip}** مو شغال حالياً`)
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle('🟢 السيرفر أونلاين!')
        .setDescription(`**\`${ip}\`**`)
        .addFields(
          { name: '👥 اللاعبين', value: `${data.players?.online ?? 0} / ${data.players?.max ?? 0}`, inline: true },
          { name: '📌 الإصدار', value: data.version ?? 'غير معروف', inline: true },
          { name: '📊 الحالة', value: '🟢 أونلاين', inline: true },
          { name: '📝 MOTD', value: data.motd?.clean?.[0] ?? 'لا يوجد', inline: false },
        )
        .setFooter({ text: 'mcsrvstat.us', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      if (data.players?.list?.length > 0) {
        embed.addFields({ name: '🎮 اللاعبين الحاليين', value: data.players.list.slice(0, 10).join(', '), inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `❌ ما قدرت أتصل بالسيرفر: ${err.message}` });
    }
  },
};
