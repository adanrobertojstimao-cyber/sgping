const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');

// Memória temporária para guardar os dados entre o Modal 1 e o Modal 2
const userData = new Map();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // --- LOGICA DE COMANDOS DE BARRA (/) ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Erro ao executar comando!', ephemeral: true });
            }
        }

        // --- 1. CLIQUE NO BOTÃO DO PAINEL (GERAR TÓPICO) ---
        if (interaction.isButton() && interaction.customId === 'confirmar_tz') {
            // CRIAR TÓPICO PRIVADO
            const thread = await interaction.channel.threads.create({
                name: `torneio-${interaction.user.username}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: 'Criação de Torneio',
            });

            await thread.members.add(interaction.user.id);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('abrir_modal_1')
                    .setLabel('1. Informações')
                    .setStyle(ButtonStyle.Primary)
            );

            await thread.send({ 
                content: `Olá ${interaction.user}, clique no botão abaixo para começar o formulário.`, 
                components: [row] 
            });

            await interaction.reply({ content: `Tópico criado: ${thread}`, ephemeral: true });
        }

        // --- 2. CLIQUE NO BOTÃO DENTRO DO TÓPICO (ABRE MODAL 1) ---
        if (interaction.isButton() && interaction.customId === 'abrir_modal_1') {
            const modal1 = new ModalBuilder().setCustomId('modal_1').setTitle('Informações do Torneio');

            modal1.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome_dc').setLabel("Seu Nome no DC").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome_jogo').setLabel("Seu Nome no Jogo").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('titulo').setLabel("Título do Torneio").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('imagem').setLabel("Link da Imagem (Capa)").setStyle(TextInputStyle.Short).setRequired(true))
            );

            await interaction.showModal(modal1);
        }

        // --- 3. RECEBE MODAL 1 -> ABRE MODAL 2 ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_1') {
            userData.set(interaction.user.id, {
                dc: interaction.fields.getTextInputValue('nome_dc'),
                jogo: interaction.fields.getTextInputValue('nome_jogo'),
                titulo: interaction.fields.getTextInputValue('titulo'),
                imagem: interaction.fields.getTextInputValue('imagem')
            });

            const modal2 = new ModalBuilder().setCustomId('modal_2').setTitle('Como é o Torneio');

            modal2.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emotes').setLabel("Emotes").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rodadas').setLabel("Rodadas").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('inscricao').setLabel("Horário Inscrição").setPlaceholder('aaaa/mm/dd - hh:mm').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('inicio').setLabel("Horário Início").setPlaceholder('aaaa/mm/dd - hh:mm').setStyle(TextInputStyle.Short).setRequired(true))
            );

            await interaction.showModal(modal2);
        }

        // --- 4. RECEBE MODAL 2 -> ENVIA EMBED FINAL E DELETA TÓPICO ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_2') {
            const data1 = userData.get(interaction.user.id);
            const canalLog = interaction.client.channels.cache.get('1489831739512586390');
            
            const embedFinal = new EmbedBuilder()
                .setTitle('Novo Torneio Solicitado')
                .setColor('Blue')
                .setThumbnail(data1.imagem)
                .addFields(
                    { name: '👤 Usuário', value: `${interaction.user}`, inline: true },
                    { name: '📝 Nome DC', value: data1.dc, inline: true },
                    { name: '🎮 Nome Jogo', value: data1.jogo, inline: true },
                    { name: '🏆 Título', value: data1.titulo },
                    { name: '🎭 Emotes', value: interaction.fields.getTextInputValue('emotes'), inline: true },
                    { name: '🔄 Rodadas', value: interaction.fields.getTextInputValue('rodadas'), inline: true },
                    { name: '📅 Inscrição', value: interaction.fields.getTextInputValue('inscricao'), inline: true },
                    { name: '🚀 Início', value: interaction.fields.getTextInputValue('inicio'), inline: true }
                )
                .setImage(data1.imagem)
                .setTimestamp();

            if (canalLog) await canalLog.send({ content: `<@${interaction.user.id}>`, embeds: [embedFinal] });

            await interaction.reply({ content: '✅ Enviado! Tópico será fechado.', ephemeral: true });
            
            // Limpa dados e apaga o tópico após 5 segundos
            userData.delete(interaction.user.id);
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    },
};
