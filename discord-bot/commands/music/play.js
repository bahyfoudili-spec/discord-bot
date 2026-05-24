const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

const queues = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('شغل موسيقى من يوتيوب 🎵')
    .addStringOption(opt =>
      opt.setName('url').setDescription('رابط يوتيوب').setRequired(true)
    ),
  cooldown: 5,

  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ لازم تكون في روم صوتي!')],
        ephemeral: true,
      });
    }

    const url = interaction.options.getString('url');
    if (!ytdl.validateURL(url)) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ رابط اليوتيوب غلط!')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const duration = Math.floor(parseInt(info.videoDetails.lengthSeconds) / 60) + ':' +
        String(parseInt(info.videoDetails.lengthSeconds) % 60).padStart(2, '0');

      const guildId = interaction.guild.id;

      if (!queues.has(guildId)) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        queues.set(guildId, { connection, player, queue: [], current: null });
      }

      const serverQueue = queues.get(guildId);
      serverQueue.queue.push({ url, title, duration, requestedBy: interaction.user.tag });

      if (serverQueue.player.state.status !== AudioPlayerStatus.Playing) {
        playNext(guildId, queues);
      }

      const embed = new EmbedBuilder()
        .setColor('#1DB954')
        .setTitle('🎵 تمت الإضافة للقائمة')
        .addFields(
          { name: 'الأغنية', value: title, inline: false },
          { name: 'المدة', value: duration, inline: true },
          { name: 'طلب من', value: interaction.user.tag, inline: true }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ صار خطأ وأنا أحمل الأغنية!')],
      });
    }
  },
};

function playNext(guildId, queues) {
  const serverQueue = queues.get(guildId);
  if (!serverQueue || serverQueue.queue.length === 0) {
    queues.delete(guildId);
    return;
  }

  const song = serverQueue.queue.shift();
  serverQueue.current = song;

  const resource = createAudioResource(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }));
  serverQueue.player.play(resource);

  serverQueue.player.once(AudioPlayerStatus.Idle, () => {
    playNext(guildId, queues);
  });
}
