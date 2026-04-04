const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunciar-mod')
        .setDescription('Anuncia novos membros da Staff')
        .addUserOption(opt => opt.setName('quem1').setDescription('Obrigatorio').setRequired(true))
        .addUserOption(opt => opt.setName('quem2').setDescription('Opcional'))
        .addUserOption(opt => opt.setName('quem3').setDescription('Opcional')),

    async execute(interaction) {
        const servidorTestes = '1479657826077900833';
        const cargosPermitidos = ['1475012884651053168', '1477814555634827549'];

        if (interaction.guild.id !== servidorTestes) {
            if (!interaction.member.roles.cache.some(r => cargosPermitidos.includes(r.id))) {
                return interaction.reply({ content: 'Você não tem permissão.', ephemeral: true });
            }
        }

        let lista = "";
        for (let i = 1; i <= 3; i++) {
            const user = interaction.options.getUser(`quem${i}`);
            if (user) lista += `\n${user}`;
        }

        const msg = `**# Novas contratações para a Staff Stumble Ping:\n${lista}\n\nSejam bem-vindos e boa sorte no período de teste!**`;
        await interaction.reply({ content: msg });
    },
};
