const Discord = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Apaga mensagens no canal.',
    options: [
        {
            name: 'quantidade',
            description: 'Número de mensagens para apagar (máx. 100)',
            type: Discord.ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const quantidade = interaction.options.getInteger('quantidade');

        // Verificar se o número está dentro do limite permitido
        if (quantidade < 1 || quantidade > 100) {
            return interaction.reply({
                content: 'Por favor, forneça um número entre 1 e 100.',
                ephemeral: true
            });
        }

        // Verificar se o usuário tem permissões adequadas
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: 'Você não tem permissão para apagar mensagens.',
                ephemeral: true
            });
        }

        // Apagar mensagens
        try {
            const deletedMessages = await interaction.channel.bulkDelete(quantidade, true);

            interaction.reply({
                content: `:white_check_mark: Apaguei ${deletedMessages.size} mensagens com sucesso!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Erro ao apagar mensagens:', error);
            interaction.reply({
                content: 'Houve um erro ao tentar apagar as mensagens.',
                ephemeral: true
            });
        }
    }
};
