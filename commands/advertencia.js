const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

// Definindo o Schema aqui para o deploy-commands não dar erro
const UserSchema = new mongoose.Schema({
    userId: String,
    advs: [{ data: String, motivo: String, autor: String, expiresAt: Date }],
    influHistory: {
        foiInflu: { type: Boolean, default: false },
        inicio: Date,
        fim: Date,
        atualmente: { type: Boolean, default: false }
    }
});

// Isso evita o erro de "Schema hasn't been registered"
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advertencia')
        .setDescription('Gerencia ADVs')
        .addStringOption(opt => opt.setName('acao').setDescription('Adverter ou Retirar').setRequired(true)
            .addChoices({name: 'Adverter', value: 'add'}, {name: 'Retirar 1', value: 'rem'}))
        .addUserOption(opt => opt.setName('quem').setDescription('Usuário').setRequired(true))
        .addStringOption(opt => opt.setName('motivo').setDescription('Motivo').setRequired(true)),

    async execute(interaction) {
        const acao = interaction.options.getString('acao');
        const target = interaction.options.getMember('quem');
        const motivo = interaction.options.getString('motivo');
        const meuID = '1013260670415937577';

        let userData = await User.findOne({ userId: target.id });
        if (!userData) userData = new User({ userId: target.id, advs: [] });

        if (acao === 'add') {
            userData.advs.push({
                data: new Date().toLocaleDateString('pt-BR'),
                motivo: motivo,
                autor: interaction.user.tag,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });

            await userData.save();

            if (userData.advs.length >= 5) {
                await target.timeout(30 * 24 * 60 * 60 * 1000, '5 Advertências');
                const dono = await interaction.client.users.fetch(meuID);
                dono.send(`⚠️ **${target.user.tag}** chegou a 5 ADVs!\nLogs:\n${userData.advs.map(a => a.motivo).join('\n')}\n\nDigite 1-Ban | 4-Tirar Mute | 5-Chat`);
            }
            return interaction.reply(`✅ ADV aplicada. Total: ${userData.advs.length}`);
        } else {
            userData.advs.pop();
            await userData.save();
            return interaction.reply(`⚠️ Uma ADV removida de ${target}.`);
        }
    }
};
