const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

// --- SISTEMA WEB (RENDER + UPTIME) ---
const app = express();
const port = process.env.PORT || 10000; // Render usa a 10000 por padrão

app.get('/', (req, res) => res.status(200).send('SG-PING Online! 🚀'));

app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Servidor Web ativo na porta ${port}`);
});

// --- CLIENTE DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- MONGO DB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Conectado!'))
    .catch(err => console.error('❌ Erro Mongo:', err));

// --- CARREGAR COMANDOS E EVENTOS ---
client.commands = new Collection();
// (Mantenha seu código atual de carregar pastas aqui embaixo...)
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

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.TOKEN).catch(console.error);
