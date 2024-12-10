const Discord = require('discord.js');
const db = require('../../database/database'); // Banco de dados
const cor = require('../../config').discord.color;

// Configuração de plataformas
const platforms = [
    { emoji: '<:tigrinho:1312523750851219619>', name: 'Tigrinho' },
    { emoji: '<:rato:1312524059786875021>', name: 'Rato' },
    { emoji: '<:coelho:1312524603276398645>', name: 'Coelho' },
    { emoji: '<:macaco:1312527776292671619>', name: 'Macaco' }
];

// Emojis com valores e pesos
const emojiValues = [
    { emoji: '💎', value: 300, weight: 1 },
    { emoji: '🎰', value: 200, weight: 2 },
    { emoji: '🍉', value: 150, weight: 3 },
    { emoji: '⭐', value: 100, weight: 4 },
    { emoji: '🎲', value: 75, weight: 5 },
    { emoji: '🔔', value: 50, weight: 6 },
    { emoji: '🍒', value: 30, weight: 7 },
    { emoji: '🍋', value: 20, weight: 8 }
];

// Multiplicador proporcional à quantia apostada
const multiplierForAmount = (amount) => 1 + (amount * 0.01); // 1% de aumento por real apostado


// Gerar tabela 3x3
const generateTable = (platformEmoji) => {
    // Criar o pool inicial com os pesos dos emojis
    const weightedPool = emojiValues.flatMap(e => Array(e.weight).fill(e));

    // Adicionar o emoji coringa com uma chance de 0.5% (em relação ao tamanho do pool atual)
    const coringaEntries = Math.max(1, Math.floor(weightedPool.length * 0.05)); // Pelo menos 1 entrada
    weightedPool.push(...Array(coringaEntries).fill({ emoji: platformEmoji }));

    // Gerar a tabela 3x3
    const table = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => weightedPool[Math.floor(Math.random() * weightedPool.length)].emoji)
    );

    return table;
};


// Calcular ganhos com base em combinações
const calculateWinnings = (table, platformEmoji) => {
    const sequences = [];

    // Adicionar linhas e colunas
    sequences.push(...table); // Linhas
    for (let i = 0; i < 3; i++) {
        sequences.push(table.map(row => row[i])); // Colunas
    }

    // Adicionar diagonais
    sequences.push([table[0][0], table[1][1], table[2][2]]);
    sequences.push([table[0][2], table[1][1], table[2][0]]);

    let totalWinnings = 0;

    // Processar cada sequência
    sequences.forEach(seq => {
        const uniqueEmojis = [...new Set(seq)];
        const isCoringa = uniqueEmojis.includes(platformEmoji);

        if (uniqueEmojis.length === 1) {
            // Três iguais
            const mainEmoji = uniqueEmojis[0];
            if (mainEmoji === platformEmoji) {
                // Três coringas
                totalWinnings += 1000; // Valor fixo para sequência de coringas
            } else {
                const emojiData = emojiValues.find(e => e.emoji === mainEmoji);
                if (emojiData) totalWinnings += emojiData.value;
            }
        } else if (uniqueEmojis.length === 2 && isCoringa) {
            // Combinação com coringa
            const mainEmoji = uniqueEmojis.find(e => e !== platformEmoji);
            const emojiData = emojiValues.find(e => e.emoji === mainEmoji);

            if (emojiData) {
                let winnings = emojiData.value;

                // Aplicar bônus de coringa
                const coringaCount = seq.filter(e => e === platformEmoji).length;
                if (coringaCount > 0) {
                    winnings *= 1 + (coringaCount * 0.2); // 20% por coringa
                }

                totalWinnings += winnings;
            }
        }
    });

    return totalWinnings;
};


module.exports = {
    name: 'bet',
    description: 'Aposte na plataforma da sorte!',
    options: [
        {
            name: 'quantia',
            type: Discord.ApplicationCommandOptionType.Integer,
            description: 'Valor da aposta (R$)',
            required: true,
            minValue: 10
        },
        {
            name: 'plataforma',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Escolha uma plataforma (Tigrinho, Rato, Coelho ou Macaco)',
            required: true,
            choices: platforms.map(platform => ({ name: platform.name, value: platform.name.toLowerCase() }))
        }
    ],
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const quantia = interaction.options.getInteger('quantia');
        const plataforma = interaction.options.getString('plataforma');
        const selectedPlatform = platforms.find(p => p.name.toLowerCase() === plataforma);

        if (!selectedPlatform) {
            return interaction.reply({ content: 'Plataforma inválida.', ephemeral: true });
        }

        const platformEmoji = selectedPlatform.emoji;

        // Verificar saldo
        db.get('SELECT wallet FROM users WHERE id = ?', [interaction.user.id], async (err, row) => {
            if (err || !row || row.wallet < quantia) {
                return interaction.reply({ content: 'Saldo insuficiente para esta aposta.', ephemeral: true });
            }

            const updatedWallet = row.wallet - quantia;

            // Atualizar carteira no banco
            db.run('UPDATE users SET wallet = ? WHERE id = ?', [updatedWallet, interaction.user.id], (updateErr) => {
                if (updateErr) {
                    console.error('Erro ao atualizar o banco:', updateErr.message);
                }
            });

            // Gerar tabela e calcular ganhos
            const table = generateTable(platformEmoji);
            let winnings = calculateWinnings(table, platformEmoji);

            winnings *= multiplierForAmount(quantia);

            const embedResult = new Discord.EmbedBuilder()
                .setColor(cor)
                .setTitle(`Plataforma do ${selectedPlatform.name}`)
                .setDescription(winnings > 0
                    ? `:dollar: | Você ganhou **R$${winnings.toFixed(2)}**!`
                    : ':x: | Infelizmente você perdeu. Tente novamente!')
                .addFields({ name: 'Tabela de Resultados', value: table.map(row => row.join(' ')).join('\n') });

            interaction.reply({ embeds: [embedResult] });

            // Atualizar ganhos
            const newWallet = updatedWallet + winnings;
            db.run('UPDATE users SET wallet = ? WHERE id = ?', [newWallet, interaction.user.id], (updateErr) => {
                if (updateErr) {
                    console.error('Erro ao atualizar ganhos:', updateErr.message);
                }
            });
        });
    }
};
