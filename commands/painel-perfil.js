const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = {
    data: new SlashCommandBuilder().setName('painel-perfil').setDescription('Veja seu status'),
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ver_perfil').setLabel('Meu Perfil').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ver_logs_adv').setLabel('Ver Meus Logs').setStyle(ButtonStyle.Secondary)
        );
        await interaction.reply({ content: 'Clique abaixo para ver suas informações:', components: [row] });
    }
};
