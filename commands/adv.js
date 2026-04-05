const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const User = mongoose.models.User || mongoose.model('User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adv')
        .setDescription('Aplica uma advertência a um membro')
        .addUserOption(option => option.setName('usuario').setDescription('O infrator').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo da punição').setRequired(true)),

    async execute(interaction) {
        // Isso evita o erro de "Interação Falhou" (Dá tempo ao bot)
        await interaction.deferReply({ ephemeral: true });

        const alvo = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo');
        const ID_CANAL_LOGS = 'COLE_AQUI_O_ID_DO_CANAL'; // <--- MUDE ISSO

        try {
            let userData = await User.findOne({ userId: alvo.id });
            if (!userData) userData = new User({ userId: alvo.id, advs: [] });

            const novaAdv = {
                data: new Date().toLocaleDateString('pt-BR'),
                motivo: motivo,
                autor: interaction.user.tag
            };

            userData.advs.push(novaAdv);
            await userData.save();

            // Enviar para o canal do servidor (Log)
            const logChannel = interaction.client.channels.cache.get(ID_CANAL_LOGS);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('⚠️ Nova Advertência')
                    .setColor('#ff0000')
                    .addFields(
                        { name: 'Infrator', value: `${alvo.tag}`, inline: true },
                        { name: 'Autor', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Motivo', value: motivo }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }

            await interaction.editReply({ content: `✅ Advertência aplicada em **${alvo.tag}** com sucesso!` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao salvar no banco de dados.' });
        }
    },
};
