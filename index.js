const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot Online e Protegido! 🛡️'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// --- CONEXÃO MONGODB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 Banco de dados conectado!'))
    .catch(err => console.error('❌ Erro Mongo:', err));

// --- MODELO DO USUÁRIO ---
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
const User = mongoose.model('User', UserSchema);

// --- RASTREIO DE INFLU ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const cargoInflu = '1475012884651053168';
    const jaTinha = oldMember.roles.cache.has(cargoInflu);
    const temAgora = newMember.roles.cache.has(cargoInflu);

    if (!jaTinha && temAgora) {
        await User.findOneAndUpdate({ userId: newMember.id }, 
            { 'influHistory.foiInflu': true, 'influHistory.inicio': new Date(), 'influHistory.atualmente': true }, 
            { upsert: true });
    } else if (jaTinha && !temAgora) {
        await User.findOneAndUpdate({ userId: newMember.id }, { 'influHistory.fim': new Date(), 'influHistory.atualmente': false });
    }
});

// (Mantenha aqui seu código de carregar comandos...)

client.login(process.env.TOKEN);
