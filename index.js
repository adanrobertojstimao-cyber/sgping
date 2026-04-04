const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

// --- SISTEMA PARA O RENDER NÃO DORMIR ---
const app = express();
app.get('/', (req, res) => res.send('Bot Online!'));
app.listen(3000, () => console.log('Servidor HTTP rodando na porta 3000'));
// ---------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.on('interactionCreate', async interaction => {
    // Lógica para Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erro ao executar!', ephemeral: true });
        }
    }

    // AQUI vai entrar a lógica de Botões e Modais que faremos a seguir
});

client.once('ready', () => {
    console.log(`Logado como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
