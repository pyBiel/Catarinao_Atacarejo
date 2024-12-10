require('colors');


// Configuração de plataformas
const platforms = [
    { emoji: '<:tigrinho:1312523750851219619>', name: 'Tigrinho', bonus: false },
    { emoji: '<:rato:1312524059786875021>', name: 'Rato', bonus: false },
    { emoji: '<:coelho:1312524603276398645>', name: 'Coelho', bonus: false },
    { emoji: '<:macaco:1312527776292671619>', name: 'Macaco', bonus: false }
];

//let favoredPlatform = null;

//const initializeFavoredPlatform = (client) => {
//    const randomIndex = Math.floor(Math.random() * platforms.length);
//    favoredPlatform = platforms[randomIndex];
//    platforms.forEach(platform => (platform.bonus = platform === favoredPlatform));

//    const channel = client.channels.cache.get('1312520025227264083'); // ID do canal
//    if (channel) {
//        channel.send(`:tada: A plataforma favorecida é **${favoredPlatform.name}** (${favoredPlatform.emoji})! Você tem 25% de chance extra de vitória nesta plataforma!`);
//        console.log(`A plataforma favorecida é **${favoredPlatform.name}**! Você tem 25% de chance extra de vitória nesta plataforma!`)
//    }
//};

const startFavoredPlatformInterval = (client) => {
    setInterval(() => {
        initializeFavoredPlatform(client);
    }, 30 * 60 * 1000); // 30 minutos
};

module.exports = {
    name: 'ready',
    execute: (client) => {
        client.on('ready', () => {
            console.log(`✅ Estou online em [${client.user.username}]`.green);

            // Inicializar e iniciar intervalo
            initializeFavoredPlatform(client);
            startFavoredPlatformInterval(client);
        });
    }
};
