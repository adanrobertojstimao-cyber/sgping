const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

// Objeto temporário para guardar dados entre modais (Armazenamento simples)
const userData = new Map();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }

        // 1. CLIQUE NO BOTÃO "INFORMAÇÕES" (MODAL 1)
        if (interaction.isButton() && interaction.customId === 'btn_info') {
            const modal = new ModalBuilder().setCustomId('modal_1').setTitle('1. Informações Gerais');
            
            const inputs = [
                new TextInputBuilder().setCustomId('nome_dc').setLabel("Seu Nome no DC").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('nome_jogo').setLabel("Seu Nome no Jogo").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('titulo').setLabel("Título do Torneio").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('imagem').setLabel("Link da Imagem").setStyle(TextInputStyle.Short).setRequired(true)
            ];

            modal.addComponents(inputs.map(i => new ActionRowBuilder().addComponents(i)));
            await interaction.showModal(modal);
        }

        // 2. RECEBE MODAL 1 -> ABRE MODAL 2
        if (interaction.isModalSubmit() && interaction.customId === 'modal_1') {
            userData.set(interaction.user.id, {
                dc: interaction.fields.getTextInputValue('nome_dc'),
                jogo: interaction.fields.getTextInputValue('nome_jogo'),
                titulo: interaction.fields.getTextInputValue('titulo'),
                imagem: interaction.fields.getTextInputValue('imagem')
            });

            const modal2 = new ModalBuilder().setCustomId('modal_2').setTitle('2. Como é o Torneio');
            const inputs2 = [
                new TextInputBuilder().setCustomId('emotes').setLabel("Emotes").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('rodadas').setLabel("Rodadas").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('inscricao').setLabel("Horário Inscrição").setPlaceholder('aaaa/mm/dd - hh:mm').setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('inicio').setLabel("Horário Início").setPlaceholder('aaaa/mm/dd - hh:mm').setStyle(TextInputStyle.Short).setRequired(true)
            ];

            modal2.addComponents(inputs2.map(i => new ActionRowBuilder().addComponents(i)));
            await interaction.showModal(modal2);
        }

        // 3. RECEBE MODAL 2 -> ENVIA EMBED FINAL
        if (interaction.isModalSubmit() && interaction.customId === 'modal_2') {
            const data1 = userData.get(interaction.user.id);
            const emotes = interaction.fields.getTextInputValue('emotes');
            const rodadas = interaction.fields.getTextInputValue('rodadas');
            const inscricao = interaction.fields.getTextInputValue('inscricao');
            const inicio = interaction.fields.getTextInputValue('inicio');

            const canalLog = interaction.client.channels.cache.get('1489831739512586390');
            
            const embedFinal = new EmbedBuilder()
                .setColor('Blue')
                .setThumbnail(data1.imagem)
                .setAuthor({ name: `Solicitado por: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: '👤 Nome DC', value: data1.dc, inline: true },
                    { name: '🎮 Nome Jogo', value: data1.jogo, inline: true },
                    { name: '🏆 Título', value: data1.titulo },
                    { name: '🎭 Emotes', value: emotes, inline: true },
                    { name: '🔄 Rodadas', value: rodadas, inline: true },
                    { name: '📅 Inscrição', value: inscricao, inline: true },
                    { name: '🚀 Início', value: inicio, inline: true }
                )
                .setImage(data1.imagem)
                .setFooter({ text: 'Stumble Ping Tournament System' });

            if (canalLog) await canalLog.send({ content: `<@${interaction.user.id}>`, embeds: [embedFinal] });

            await interaction.reply({ content: '✅ Enviado! Um dos donos entrará em contato com você.', ephemeral: true });
            userData.delete(interaction.user.id); // Limpa a memória
        }
    }
};
