const Discord = require('discord.js');
const db = require('../../database/database'); // Banco de dados
const cor = require('../../config').discord.color;

module.exports = {
    name: 'dep',
    description: 'Deposite dinheiro no banco.',
    options: [
        {
            name: 'valor',
            type: Discord.ApplicationCommandOptionType.Integer,
            description: 'O valor que deseja depositar.',
            required: true,
            minValue: 1
        }
    ],
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const valor = interaction.options.getInteger('valor');
        const userId = interaction.user.id;

        // Verificar se o usuário tem dinheiro suficiente na carteira
        db.get('SELECT wallet, bank FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Erro ao acessar o banco:', err.message);
                return interaction.reply({ content: 'Erro ao acessar o banco de dados.', ephemeral: true });
            }

            if (!row || row.wallet < valor) {
                return interaction.reply({
                    content: 'Você não tem dinheiro suficiente na carteira para realizar este depósito.',
                    ephemeral: true
                });
            }

            // Atualizar os valores no banco de dados
            const novoWallet = row.wallet - valor;
            const novoBank = (row.bank || 0) + valor;

            db.run(
                'UPDATE users SET wallet = ?, bank = ? WHERE id = ?',
                [novoWallet, novoBank, userId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar o banco de dados:', updateErr.message);
                        return interaction.reply({
                            content: 'Ocorreu um erro ao processar o depósito.',
                            ephemeral: true
                        });
                    }

                    // Resposta de sucesso
                    const embed = new Discord.EmbedBuilder()
                        .setColor(cor)
                        .setTitle('Depósito realizado com sucesso!')
                        .setDescription(
                            `:bank: Você depositou **R$${valor.toFixed(2)}** no banco.\n\n` +
                            `💳 **Carteira:** R$${novoWallet.toFixed(2)}\n🏦 **Banco:** R$${novoBank.toFixed(2)}`
                        );

                    interaction.reply({ embeds: [embed] });
                }
            );
        });
    }
};
