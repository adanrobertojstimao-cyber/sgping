const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');

const userData = new Map();
const userLogs = new Map(); // Para o sistema de advertência (Simulado sem DB por enquanto)

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }

        // --- BOTÃO DO PAINEL ---
        if (interaction.isButton() && interaction.customId === 'confirmar_tz') {
            const thread = await interaction.channel.threads.create({
                name: `torneio-${interaction.user.username}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
            });

            await thread.members.add(interaction.user.id);

            const embedAviso = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(`**Atenção!** O numero de usos só são diminuidos se o torneio for confirmado...\n\nNo link da imagem você pode mandar o link ou mandar na DM.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('abrir_modal_1').setLabel('1. Informações').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('abrir_modal_2_direto').setLabel('2. Detalhes').setStyle(ButtonStyle.Secondary)
            );

            await thread.send({ content: `Olá ${interaction.user}`, embeds: [embedAviso], components: [row] });
            await interaction.reply({ content: `Tópico aberto: ${thread}`, ephemeral: true });
        }

        // --- LÓGICA DO MODAL 1 ---
        if (interaction.isButton() && interaction.customId === 'abrir_modal_1') {
            const modal = new ModalBuilder().setCustomId('modal_1').setTitle('Informações (1/2)');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome_dc').setLabel("Nome DC").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome_jogo').setLabel("Nome Jogo").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('titulo').setLabel("Título").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('imagem').setLabel("Link Imagem").setStyle(TextInputStyle.Short))
            );
            await interaction.showModal(modal);
        }

        // --- RECEBE MODAL 1 -> SALVA E AVISA ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_1') {
            userData.set(interaction.user.id, {
                dc: interaction.fields.getTextInputValue('nome_dc'),
                jogo: interaction.fields.getTextInputValue('nome_jogo'),
                titulo: interaction.fields.getTextInputValue('titulo'),
                imagem: interaction.fields.getTextInputValue('imagem')
            });
            await interaction.reply({ content: "✅ Parte 1 salva! Agora clique no botão **2. Detalhes**.", ephemeral: true });
        }

        // --- ABRE MODAL 2 ---
        if (interaction.isButton() && interaction.customId === 'abrir_modal_2_direto') {
            if (!userData.has(interaction.user.id)) return interaction.reply({ content: "Preencha a Parte 1 primeiro!", ephemeral: true });
            
            const modal2 = new ModalBuilder().setCustomId('modal_2').setTitle('Detalhes (2/2)');
            modal2.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emotes').setLabel("Emotes").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rodadas').setLabel("Rodadas").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('inscricao').setLabel("Inscrição").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('inicio').setLabel("Início").setStyle(TextInputStyle.Short))
            );
            await interaction.showModal(modal2);
        }

        // --- RECEBE MODAL 2 -> GERA EMBED FINAL ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_2') {
            const d1 = userData.get(interaction.user.id);
            const canalLog = interaction.client.channels.cache.get('1489831739512586390');
            
            const embed = new EmbedBuilder()
                .setTitle('🏆 NOVO TORNEIO')
                .addFields(
                    { name: '👤 Usuário', value: `${interaction.user}`, inline: true },
                    { name: '🎮 Jogo', value: d1.jogo, inline: true },
                    { name: '🏆 Título', value: d1.titulo },
                    { name: '🎭 Emotes', value: interaction.fields.getTextInputValue('emotes'), inline: true },
                    { name: '📅 Início', value: interaction.fields.getTextInputValue('inicio'), inline: true }
                ).setImage(d1.imagem);

            if (canalLog) await canalLog.send({ embeds: [embed] });
            await interaction.reply({ content: "Enviado! O tópico fechará em breve.", ephemeral: true });
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }
};
