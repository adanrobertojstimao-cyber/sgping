const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true, // Isso garante que o log só apareça uma vez quando o bot ligar
    execute(client) {
        console.log(`✅ Logado com sucesso como ${client.user.tag}!`);
        
        // Define o status do bot (opcional, mas fica profissional)
        client.user.setActivity('Gerenciando Torneios 🏆', { type: ActivityType.Watching });
        
        console.log('🚀 O bot está online e pronto para uso!');
    },
};
