const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

// --- CONFIGURAÇÃO PARA MANTER ONLINE NO RENDER ---
const app = express();
app.get('/', (req, res) => res.send('Bot da Stumble Ping está Online! 🚀'));
app.listen(3000, () => console.log('🌐 Servidor Web ativo na porta 3000'));
// ------------------------------------------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Coleções para Comandos e Status
client.commands = new Collection();

// --- HANDLER DE COMANDOS ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[AVISO] O comando em ${filePath} está faltando "data" ou "execute".`);
        }
    }
}

// --- HANDLER DE EVENTOS ---
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

// Evento padrão de inicialização
client.once('ready', () => {
    console.log(`✅ Logado com sucesso como ${client.user.tag}`);
    console.log(`🤖 Bot carregado com ${client.commands.size} comandos.`);
});

// Login usando a variável de ambiente do Render
client.login(process.env.TOKEN);
