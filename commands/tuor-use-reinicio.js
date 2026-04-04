const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tuor-use-reinicio')
        .setDescription('Reinicia os usos de torneio de um usuário')
        .addUserOption(opt => opt.setName('usuario').setDescription('Quem terá os usos resetados').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Só admins usam

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        
        // Aqui futuramente entra a lógica de banco de dados
        await interaction.reply({ 
            content: `🔄 Os usos de torneio de ${user} foram reiniciados com sucesso!`, 
            ephemeral: true 
        });
    },
};
