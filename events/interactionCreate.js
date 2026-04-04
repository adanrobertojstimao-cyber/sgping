const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');

// Mapa para guardar os dados entre um modal e outro
const userData = new Map();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }

        // --- 1. BOTÃO DO PAINEL: CRIA TÓPICO ---
        if (interaction.isButton() && interaction.customId === 'confirmar_tz') {
            const thread = await interaction.channel.threads.create({
                name: `torneio-${interaction.user.username}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
            });

            await thread.members.add(interaction.user.id);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('abrir_modal_1')
                    .setLabel('Começar Formulário')
                    .setStyle(ButtonStyle.Primary)
            );

            await thread.send({ content: `Olá ${interaction.user}, clique no botão para iniciar o preenchimento.`, components: [row] });
            await interaction.reply({ content: `Tópico aberto: ${thread}`, ephemeral: true });
        }

        // --- 2. ABRE O PRIMEIRO MODAL ---
        if (interaction.isButton() && interaction.customId === 'abrir_modal_1') {
            const modal = new ModalBuilder().setCustomId('modal_1').setTitle('Informações Gerais (1/2)');

            const inputs = [
                new TextInputBuilder().setCustomId('nome_dc').setLabel("Nome no Discord").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('nome_jogo').setLabel("Nome no Jogo").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('titulo').setLabel("Título do Torneio").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('imagem').setLabel("Link da Imagem/Capa").setStyle(TextInputStyle.Short).setRequired(true)
            ];

            modal.addComponents(inputs.map(i => new ActionRowBuilder().addComponents(i)));
            await interaction.showModal(modal);
        }

        // --- 3. RECEBE MODAL 1 E ABRE O MODAL 2 ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_1') {
            // SALVA OS DADOS DO PRIMEIRO MODAL
            userData.set(interaction.user.id, {
                dc: interaction.fields.getTextInputValue('nome_dc'),
                jogo: interaction.fields.getTextInputValue('nome_jogo'),
                titulo: interaction.fields.getTextInputValue('titulo'),
                imagem: interaction.fields.getTextInputValue('imagem')
            });

            const modal2 = new ModalBuilder().setCustomId('modal_2').setTitle('Detalhes do Torneio (2/2)');
            
            const inputs2 = [
                new TextInputBuilder().setCustomId('emotes').setLabel("Emotes Permitidos").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('rodadas').setLabel("Quantidade de Rodadas").setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('inscricao').setLabel("Data/Hora Inscrição").setPlaceholder('00/00 - 00:00').setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('inicio').setLabel("Data/Hora Início").setPlaceholder('00/00 - 00:00').setStyle(TextInputStyle.Short).setRequired(true)
            ];

            modal2.addComponents(inputs2.map(i => new ActionRowBuilder().addComponents(i)));
            await interaction.showModal(modal2);
        }

        // --- 4. RECEBE MODAL 2 E GERA O EMBED COMPLETO ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_2') {
            const data1 = userData.get(interaction.user.id);
            if (!data1) return interaction.reply({ content: "Erro ao recuperar dados. Tente novamente.", ephemeral: true });

            const canalLog = interaction.client.channels.cache.get('1489831739512586390');

            const embedFinal = new EmbedBuilder()
                .setTitle('📢 NOVA SOLICITAÇÃO DE TORNEIO')
                .setColor('Blue')
                .setThumbnail(data1.imagem)
                .addFields(
                    { name: '👤 Solicitante', value: `${interaction.user} (\`${data1.dc}\`)`, inline: true },
                    { name: '🎮 Nick no Jogo', value: data1.jogo, inline: true },
                    { name: '🏆 Título', value: data1.titulo, inline: false },
                    { name: '🎭 Emotes', value: interaction.fields.getTextInputValue('emotes'), inline: true },
                    { name: '🔄 Rodadas', value: interaction.fields.getTextInputValue('rodadas'), inline: true },
                    { name: '📝 Inscrição', value: interaction.fields.getTextInputValue('inscricao'), inline: true },
                    { name: '🚀 Início', value: interaction.fields.getTextInputValue('inicio'), inline: true }
                )
                .setImage(data1.imagem)
                .setFooter({ text: 'Stumble Ping • Sistema de Torneios' })
                .setTimestamp();

            if (canalLog) {
                await canalLog.send({ content: `Novo torneio enviado por ${interaction.user}`, embeds: [embedFinal] });
            }

            await interaction.reply({ content: '✅ Tudo pronto! Suas informações foram enviadas para a staff.', ephemeral: true });
            
            // Limpa a memória e fecha o tópico
            userData.delete(interaction.user.id);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }
};
