const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('إرسال بانل السيرفر الاحترافي 📋')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('welcome').setDescription('إرسال رسالة الترحيب')
    )
    .addSubcommand(sub =>
      sub.setName('rules').setDescription('إرسال قواعد السيرفر')
    )
    .addSubcommand(sub =>
      sub.setName('roles').setDescription('إرسال أدوار الإشعارات')
    )
    .addSubcommand(sub =>
      sub.setName('all').setDescription('إرسال كل البانلات دفعة واحدة')
    ),
  cooldown: 10,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    await interaction.deferReply({ ephemeral: true });

    // ─── Welcome Panel ────────────────────────────────────────────────────
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🌟 أهلاً وسهلاً في Veo')
      .setDescription(
        '> مرحباً بك في سيرفر **Veo**!\n' +
        '> نسعد بانضمامك لمجتمعنا المميز.\n' +
        '> تأكد من قراءة القواعد والاستمتاع بوقتك! 🎉'
      )
      .addFields(
        {
          name: '📌 روابط مهمة',
          value:
            '🔗 [سيرفر الديسكورد](https://discord.gg/veo)\n' +
            '🎫 [فتح تذكرة دعم](https://discord.gg/veo)\n' +
            '📢 [قناة الأخبار](#)',
          inline: true,
        },
        {
          name: '📋 قنوات مهمة',
          value:
            '📜 <#rules> ← القواعد\n' +
            '🎭 <#roles> ← الأدوار\n' +
            '🎫 <#tickets> ← الدعم',
          inline: true,
        }
      )
      .setImage('https://i.imgur.com/your-banner.png')
      .setFooter({ text: `Veo • ${new Date().getFullYear()}`, iconURL: guild.iconURL() })
      .setTimestamp();

    const welcomeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('📜 القواعد')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('panel_rules_btn'),
      new ButtonBuilder()
        .setLabel('🎫 فتح تذكرة')
        .setStyle(ButtonStyle.Success)
        .setCustomId('ticket_open_support'),
      new ButtonBuilder()
        .setLabel('🔗 ديسكورد')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/veo')
    );

    // ─── Rules Panel ──────────────────────────────────────────────────────
    const rulesEmbed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('📜 قواعد سيرفر Veo')
      .setDescription('> يرجى الالتزام بهذه القواعد للحفاظ على بيئة محترمة للجميع.')
      .addFields(
        {
          name: '1️⃣ الاحترام المتبادل',
          value: 'احترام جميع الأعضاء بغض النظر عن الجنسية أو الدين أو الرأي. الشتم والإهانة ممنوع منعاً باتاً.',
          inline: false,
        },
        {
          name: '2️⃣ ممنوع السب والقذف',
          value: 'السب أو القذف أو أي كلام بذيء تجاه أي عضو يعرضك للباند الفوري.',
          inline: false,
        },
        {
          name: '3️⃣ ممنوع الأجندات الخارجية',
          value: 'ممنوع الترويج لأي أجندات سياسية أو طائفية أو عنصرية بأي شكل من الأشكال.',
          inline: false,
        },
        {
          name: '4️⃣ ممنوع الإعلانات والترويج',
          value: 'ممنوع الترويج لأي سيرفر أو موقع أو منتج بدون إذن من الإدارة.',
          inline: false,
        },
        {
          name: '5️⃣ ممنوع السبام',
          value: 'ممنوع إرسال رسائل متكررة أو رموز تعبيرية مفرطة أو منشن بدون سبب.',
          inline: false,
        },
        {
          name: '6️⃣ احترام الخصوصية',
          value: 'ممنوع نشر معلومات شخصية لأي عضو بدون موافقته.',
          inline: false,
        },
        {
          name: '7️⃣ اتبع تعليمات الإدارة',
          value: 'قرارات الإدارة نهائية. في حال الاعتراض افتح تذكرة.',
          inline: false,
        },
        {
          name: '⚠️ العقوبات',
          value: '`إنذار` ← `ميوت` ← `كيك` ← `باند دائم`',
          inline: false,
        }
      )
      .setFooter({ text: 'Veo • القواعد قابلة للتغيير في أي وقت', iconURL: guild.iconURL() })
      .setTimestamp();

    // ─── Notification Roles Panel ─────────────────────────────────────────
    const rolesEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('🔔 أدوار الإشعارات')
      .setDescription(
        '> اختر الأدوار اللي تبغي تتابعها!\n' +
        '> اضغط على الزر لأخذ أو إزالة الدور.'
      )
      .addFields(
        { name: '📢 أخبار', value: 'آخر أخبار وتحديثات السيرفر', inline: true },
        { name: '🎮 إيفنتات', value: 'إشعارات عند بدء الإيفنتات', inline: true },
        { name: '🆕 تحديثات', value: 'تحديثات وإصلاحات جديدة', inline: true },
        { name: '🎁 هدايا', value: 'إشعارات الهدايا والمسابقات', inline: true },
        { name: '📝 استطلاعات', value: 'شارك برأيك في الاستطلاعات', inline: true },
        { name: '🤝 شراكات', value: 'إعلانات الشراكات الجديدة', inline: true },
      )
      .setFooter({ text: 'Veo • اضغط للحصول على الدور', iconURL: guild.iconURL() });

    const rolesRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('role_news').setLabel('📢 أخبار').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('role_events').setLabel('🎮 إيفنتات').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('role_updates').setLabel('🆕 تحديثات').setStyle(ButtonStyle.Secondary),
    );

    const rolesRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('role_giveaway').setLabel('🎁 هدايا').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('role_polls').setLabel('📝 استطلاعات').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('role_partnerships').setLabel('🤝 شراكات').setStyle(ButtonStyle.Secondary),
    );

    // ─── Send Panels ──────────────────────────────────────────────────────
    if (sub === 'welcome' || sub === 'all') {
      await interaction.channel.send({ embeds: [welcomeEmbed], components: [welcomeRow] });
    }
    if (sub === 'rules' || sub === 'all') {
      await interaction.channel.send({ embeds: [rulesEmbed] });
    }
    if (sub === 'roles' || sub === 'all') {
      await interaction.channel.send({ embeds: [rolesEmbed], components: [rolesRow1, rolesRow2] });
    }

    await interaction.editReply({ content: '✅ تم إرسال البانل بنجاح!' });
  },
};
