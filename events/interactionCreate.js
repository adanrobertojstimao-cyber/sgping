const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // 1. LÓGICA DO BOTÃO "CONFIRMAR" PARA ABRIR MODAL
        if (interaction.isButton() && interaction.customId === 'confirmar_tz') {
            const modal = new ModalBuilder()
                .setCustomId('modal_info_tz')
                .setTitle('Informações do Torneio');

            const nomeDC = new TextInputBuilder()
                .setCustomId('nome_dc')
                .setLabel("Seu Nome no Discord")
                .setStyle(TextInputStyle.Short).setRequired(true);

            const nomeJogo = new TextInputBuilder()
                .setCustomId('nome_jogo')
                .setLabel("Seu Nome no Jogo")
                .setStyle(TextInputStyle.Short).setRequired(true);

            const titulo = new TextInputBuilder()
                .setCustomId('titulo_tz')
                .setLabel("Título do Torneio")
                .setStyle(TextInputStyle.Short).setRequired(true);

            const imagem = new TextInputBuilder()
                .setCustomId('link_imagem')
                .setLabel("Link da Imagem")
                .setStyle(TextInputStyle.Short).setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nomeDC),
                new ActionRowBuilder().addComponents(nomeJogo),
                new ActionRowBuilder().addComponents(titulo),
                new ActionRowBuilder().addComponents(imagem)
            );

            await interaction.showModal(modal);
        }

        // 2. LÓGICA DO ENVIO DO MODAL (QUANDO O USER CLICA EM ENVIAR NO FORM)
        if (interaction.isModalSubmit() && interaction.customId === 'modal_info_tz') {
            const nome = interaction.fields.getTextInputValue('nome_dc');
            const jogo = interaction.fields.getTextInputValue('nome_jogo');
            const titulo = interaction.fields.getTextInputValue('titulo_tz');
            const capa = interaction.fields.getTextInputValue('link_imagem');

            const canalLog = interaction.client.channels.cache.get('1489831739512586390');

            const embedLog = new EmbedBuilder()
                .setTitle('Novo Torneio Solicitado')
                .setColor('Gold')
                .addFields(
                    { name: 'Usuário', value: `${interaction.user}` },
                    { name: 'Nome DC', value: nome, inline: true },
                    { name: 'Nome Jogo', value: jogo, inline: true },
                    { name: 'Título', value: titulo },
                    { name: 'Link Capa', value: capa }
                );

            if (canalLog) await canalLog.send({ embeds: [embedLog] });

            await interaction.reply({ content: 'Enviado! Um dos donos entrará em contato.', ephemeral: true });
        }
    },
};
