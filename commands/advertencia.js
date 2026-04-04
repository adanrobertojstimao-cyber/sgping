const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Simulação de banco de dados simples (limpa se o bot reiniciar)
const advs = new Map(); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advertencia')
        .setDescription('Aplica ou retira advertência')
        .addStringOption(opt => opt.setName('acao').setDescription('Adverter ou Retirar').setRequired(true)
            .addChoices({name: 'Adverter', value: 'add'}, {name: 'Retirar 1', value: 'rem'}))
        .addUserOption(opt => opt.setName('quem').setDescription('Usuário').setRequired(true))
        .addStringOption(opt => opt.setName('motivo').setDescription('Motivo').setRequired(true)),

    async execute(interaction) {
        const acao = interaction.options.getString('acao');
        const target = interaction.options.getMember('quem');
        const motivo = interaction.options.getString('motivo');
        const meuID = '1013260670415937577';

        if (!advs.has(target.id)) advs.set(target.id, []);
        const logs = advs.get(target.id);

        if (acao === 'add') {
            const data = new Date().toISOString().split('T')[0];
            logs.push(`[${data}] [${motivo}] [advertido por ${interaction.user.tag}]`);
            
            if (logs.length >= 5) {
                // Mute de 30 dias (usando timeout do Discord)
                await target.timeout(30 * 24 * 60 * 60 * 1000, '5 Advertências acumuladas');
                
                const dono = await interaction.client.users.fetch(meuID);
                const msgDono = `O usuario ${target} chegou a 5 advertencias.\n\nLogs:\n${logs.join('\n')}\n\n1. Banir | 2. Ver Logs | 3. Manter Mute | 4. Tirar Mute | 5. Iniciar Chat`;
                await dono.send(msgDono);
            }
            await interaction.reply(`Advertência aplicada a ${target}. Total: ${logs.length}`);
        } else {
            logs.pop();
            await interaction.reply(`Retirada 1 advertência de ${target}. Restantes: ${logs.length}`);
        }
    }
};
