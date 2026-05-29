const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ECONOMY_PATH = path.join(__dirname, '../../data/economy.json');
const CONFIG_PATH = path.join(__dirname, '../../data/shop_config.json');

function load(p) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, '{}');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; }
}
function save(p, db) { fs.writeFileSync(p, JSON.stringify(db, null, 2)); }

const DEFAULT_ITEMS = [
  { id: 'moiy', name: 'رتبة Moiy 🌿', price: 500, roleId: null, description: 'رتبة Moiy الأساسية' },
  { id: 'moiy_plus', name: 'رتبة Moiy+ 💜', price: 1000, roleId: null, description: 'رتبة Moiy+ المميزة' },
  { id: 'mvp', name: 'رتبة MVP ⭐', price: 2000, roleId: null, description: 'رتبة MVP الذهبية' },
  { id: 'mage', name: 'رتبة MAGE 🔮', price: 3500, roleId: null, description: 'أعلى رتبة MAGE' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 متجر السيرفر')
    .addSubcommand(sub => sub.setName('view').setDescription('شوف المتجر'))
    .addSubcommand(sub =>
      sub.setName('buy').setDescription('اشتري عنصر')
        .addStringOption(o =>
          o.setName('item').setDescription('العنصر').setRequired(true)
            .addChoices(
              { name: 'رتبة Moiy 🌿 — 500 كوين', value: 'moiy' },
              { name: 'رتبة Moiy+ 💜 — 1000 كوين', value: 'moiy_plus' },
              { name: 'رتبة MVP ⭐ — 2000 كوين', value: 'mvp' },
              { name: 'رتبة MAGE 🔮 — 3500 كوين', value: 'mage' },
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('setrole').setDescription('👑 [أدمن] ربط رتبة بعنصر المتجر')
        .addStringOption(o =>
          o.setName('item').setDescription('العنصر').setRequired(true)
            .addChoices(
              { name: 'Moiy', value: 'moiy' },
              { name: 'Moiy+', value: 'moiy_plus' },
              { name: 'MVP', value: 'mvp' },
              { name: 'MAGE', value: 'mage' },
            )
        )
        .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    ),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = load(CONFIG_PATH);
    const economy = load(ECONOMY_PATH);
    const guildId = interaction.guild.id;
    if (!config[guildId]) config[guildId] = {};

    const items = DEFAULT_ITEMS.map(i => ({
      ...i,
      roleId: config[guildId][i.id] || null,
    }));

    // ─── View ────────────────────────────────────────────────
    if (sub === 'view') {
      const userEco = economy[interaction.user.id] || { balance: 0 };
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🛒 متجر السيرفر')
        .setDescription(`رصيدك: **${userEco.balance.toLocaleString()} 🪙**\n\nاستخدم \`/shop buy\` لشراء رتبة!`)
        .addFields(items.map(i => ({
          name: `${i.name}`,
          value: `💰 **${i.price.toLocaleString()} كوين**\n${i.description}\n${i.roleId ? `🎖️ <@&${i.roleId}>` : '⚠️ الرتبة غير مُعيَّنة'}`,
          inline: true,
        })))
        .setFooter({ text: 'اكسب كوينز من /economy daily أو التحدث في السيرفر' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ─── Buy ─────────────────────────────────────────────────
    if (sub === 'buy') {
      const itemId = interaction.options.getString('item');
      const item = items.find(i => i.id === itemId);
      if (!item) return interaction.reply({ content: '❌ العنصر غير موجود!', ephemeral: true });

      if (!item.roleId) return interaction.reply({ content: '⚠️ هذا العنصر غير متاح حالياً (لم يتم ربطه برتبة بعد).', ephemeral: true });

      if (!economy[interaction.user.id]) economy[interaction.user.id] = { balance: 0, lastDaily: 0, totalEarned: 0 };
      const user = economy[interaction.user.id];

      if (user.balance < item.price) {
        return interaction.reply({ content: `❌ ما عندك كافي!\nتحتاج: **${item.price} كوين** | رصيدك: **${user.balance} كوين**`, ephemeral: true });
      }

      // Check if already has role
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (member.roles.cache.has(item.roleId)) {
        return interaction.reply({ content: `⚠️ عندك **${item.name}** مسبقاً!`, ephemeral: true });
      }

      user.balance -= item.price;
      save(ECONOMY_PATH, economy);

      try {
        await member.roles.add(item.roleId);
      } catch {
        user.balance += item.price;
        save(ECONOMY_PATH, economy);
        return interaction.reply({ content: '❌ ما قدرت أضيف الرتبة! تأكد أن البوت عنده صلاحية.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle('✅ تم الشراء!')
        .setDescription(`اشتريت **${item.name}**!\nرصيدك الجديد: **${user.balance.toLocaleString()} كوين**`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ─── Set Role ────────────────────────────────────────────
    if (sub === 'setrole') {
      if (!interaction.member.permissions.has('Administrator'))
        return interaction.reply({ content: '❌ هذا الأمر للأدمن فقط!', ephemeral: true });

      const itemId = interaction.options.getString('item');
      const role = interaction.options.getRole('role');
      config[guildId][itemId] = role.id;
      save(CONFIG_PATH, config);

      const item = DEFAULT_ITEMS.find(i => i.id === itemId);
      return interaction.reply({ content: `✅ تم ربط **${item.name}** بـ **${role.name}**`, ephemeral: true });
    }
  },
};
