const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const tempStorage = new Map();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const cmd = interaction.client.commands.get(interaction.commandName);
            if (cmd) await cmd.execute(interaction);
        }

        // CLIQUE NO BOTÃO DO PAINEL
        if (interaction.isButton() && interaction.customId === 'confirmar_tz') {
            // Criar Tópico Privado
            const thread = await interaction.channel.threads.create({
                name: `torneio-${interaction.user.username}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: 'Criação de Torneio',
            });

            await thread.members.add(interaction.user.id);

            const row = new ActionRowBuilder().addComponents(
                new (require('discord.js').ButtonBuilder)()
                    .setCustomId('abrir_modal_1')
                    .setLabel('1. Preencher Informações')
                    .setStyle(1)
            );

            await thread.send({ content: `Olá ${interaction.user}, use os botões abaixo para configurar seu torneio.`, components: [row] });
            await interaction.reply({ content: `Tópico criado: ${thread}`, ephemeral: true });
        }

        // LÓGICA DOS MODAIS (Mesma do passo anterior, enviando para 1489831739512586390)
        // ... (Se precisar que eu repita o código dos modais aqui dentro, me avise!)
    }
};
