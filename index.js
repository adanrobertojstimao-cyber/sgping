const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
app.get('/', (req, res) => res.send('Bot Online! 🚀'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
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
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- CARREGAR COMANDOS ---
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// --- CARREGAR EVENTOS ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// ... (resto do seu código acima)

console.log('Attempting to login to Discord...');

client.login(process.env.TOKEN)
    .then(() => {
        console.log('✅ LOGIN EXECUTADO COM SUCESSO!');
    })
    .catch((err) => {
        console.error('❌ ERRO NO LOGIN DO DISCORD:');
        console.error(err);
    });
