const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // ─── Cooldown System ──────────────────────────────────────────────────
    const { cooldowns } = client;
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Map());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown ?? 3) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF4444')
              .setDescription(`⏳ استنى **${remaining}** ثانية قبل تستخدم \`/${command.data.name}\` مرة ثانية!`)
          ],
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // ─── Execute Command ──────────────────────────────────────────────────
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error in /${command.data.name}:`, error);
      const errMsg = {
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ خطأ')
            .setDescription('صار خطأ وأنا أشغل هذا الأمر. جرب مرة ثانية!')
        ],
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errMsg);
      } else {
        await interaction.reply(errMsg);
      }
    }
  },
};
