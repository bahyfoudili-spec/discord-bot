const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/autoresponder.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (!fs.existsSync(dataPath)) return;

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const guildData = data[message.guild.id];
    if (!guildData) return;

    const content = message.content.toLowerCase();

    for (const [trigger, response] of Object.entries(guildData)) {
      if (content.includes(trigger)) {
        await message.reply(response);
        break;
      }
    }
  },
};
