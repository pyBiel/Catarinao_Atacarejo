const Discord = require('discord.js');
const db = require('../../database/database'); // Importa o banco de dados
const cor = require('../../config').discord.color;

module.exports = {
    name: 'saldo',
    description: 'Veja o saldo de um usuário!',
    options: [
        {
            name: 'user',
            description: 'Mencione um usuário para ver o saldo dele.',
            type: Discord.ApplicationCommandOptionType.User,
            required: false
        }
    ],
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const target = interaction.options.getUser('user') || interaction.user;

        // Consultar ou inicializar o usuário no banco
        db.get('SELECT * FROM users WHERE id = ?', [target.id], (err, row) => {
            if (err) {
                console.error('Erro ao consultar o banco:', err.message);
                return interaction.reply({ content: 'Erro ao acessar o banco de dados!', ephemeral: false });
            }

            // Se o usuário não existe, inicializa os valores padrão
            if (!row) {
                db.run('INSERT INTO users (id) VALUES (?)', [target.id], (insertErr) => {
                    if (insertErr) {
                        console.error('Erro ao inserir no banco:', insertErr.message);
                        return interaction.reply({ content: 'Erro ao inicializar dados do usuário!', ephemeral: false });
                    }
                    // Retorna os valores padrão
                    return sendEmbed(interaction, target, 0, 0, 0);
                });
            } else {
                // Retorna os valores do banco
                sendEmbed(interaction, target, row.wallet, row.bank, row.dirty_money);
            }
        });

        // Função para enviar o embed com as informações financeiras
        function sendEmbed(interaction, user, wallet, bank, dirtyMoney) {
            const embed = new Discord.EmbedBuilder()
                .setColor(cor)
                .setTitle(`Saldo de ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: ':dollar: | Carteira', value: `R$${wallet}`, inline: true },
                    { name: ':bank: | Banco', value: `R$${bank}`, inline: true },
                    { name: ':moneybag: | Dinheiro sujo', value: `R$${dirtyMoney}`, inline: true }
                )
                .setFooter({ text: `Comando executado por ${interaction.user.tag}` });

            interaction.reply({ embeds: [embed] });
        }
    }
};
