const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);

    const activities = [
      { name: '🎮 /help for commands', type: ActivityType.Playing },
      { name: `🌐 ${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: '🎵 Music & Fun', type: ActivityType.Listening },
    ];

    let i = 0;
    setInterval(() => {
      client.user.setActivity(activities[i % activities.length]);
      i++;
    }, 10000);
  },
};
