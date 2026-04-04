const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status-tz')
        .setDescription('Muda o status dos torneios')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('determinar')
                .setDescription('Estado do torneio')
                .setRequired(true)
                .addChoices(
                    { name: '🟢 Aberto', value: 'aberto' },
                    { name: '🔴 Fechado', value: 'fechado' }
                )),
    async execute(interaction) {
        const escolha = interaction.options.getString('determinar');
        
        // Aqui você pode salvar essa variável em algum lugar. 
        // Por enquanto, apenas confirmamos a mudança.
        const statusTexto = escolha === 'aberto' ? '🟢 Aberto' : '🔴 Fechado';
        
        await interaction.reply({ 
            content: `Status alterado para: **${statusTexto}**`, 
            ephemeral: true 
        });
    },
};
