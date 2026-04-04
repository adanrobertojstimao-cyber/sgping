const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-tz')
        .setDescription('Envia o painel de criação de torneio')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏆 Solicitação de Torneio')
            .setDescription('Clique no botão abaixo para iniciar o formulário de criação do seu torneio.\n\n**Atenção:** Um tópico privado será aberto para você preencher os dados.')
            .setColor('DarkBlue')
            .setFooter({ text: 'Stumble Ping - Sistema Automático' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirmar_tz')
                .setLabel('Criar Torneio')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📝')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
