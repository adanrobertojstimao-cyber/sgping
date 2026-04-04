const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tuor-use')
        .setDescription('Reduz usos de torneio')
        .addUserOption(opt => opt.setName('para_quem').setDescription('Usuário').setRequired(true))
        .addIntegerOption(opt => opt.setName('quantos').setDescription('Quantidade a reduzir').setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('para_quem');
        const reducao = interaction.options.getInteger('quantos');
        
        // Simulação de valor (Já que não temos o banco de dados ainda)
        const totalAntes = 8; 

        await interaction.reply({ 
            content: `Foram reduzidos ${reducao} uso(s) de ${user} que tinha total de ${totalAntes} antes da redução.`, 
            ephemeral: true 
        });
    },
};
