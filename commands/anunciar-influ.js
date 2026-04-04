const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunciar-influ')
        .setDescription('Anuncia novos influenciadores')
        .addUserOption(opt => opt.setName('quem1').setDescription('Obrigatorio').setRequired(true))
        .addUserOption(opt => opt.setName('quem2').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem3').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem4').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem5').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem6').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem7').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem8').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem9').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem10').setDescription('Opcional')),

    async execute(interaction) {
        const servidorTestes = '1479657826077900833';
        const cargosPermitidos = ['1475012884651053168', '1477814555634827549'];

        // Se NÃO for o servidor de testes E o cara NÃO tiver os cargos, barra.
        if (interaction.guild.id !== servidorTestes) {
            if (!interaction.member.roles.cache.some(r => cargosPermitidos.includes(r.id))) {
                return interaction.reply({ content: 'Você não tem permissão neste servidor.', ephemeral: true });
            }
        }

        let lista = "";
        for (let i = 1; i <= 10; i++) {
            const user = interaction.options.getUser(`quem${i}`);
            if (user) lista += `\n${user}`;
        }

        const msg = `**# Após a revisão do formulario foi decididos que esse são os novos criadores de conteudo da stumble ping:\n${lista}\n\nCaso você não foi aprovado não xingue no chat caso contrario recebera um mute de 1 dia.\nparabens aos novo influenciadores!**`;
        
        await interaction.reply({ content: msg });
    },
};
