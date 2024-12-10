const Discord = require('discord.js');
const db = require('../../database/database'); // Importa o banco de dados

module.exports = {
    name: 'infojob',
    description: 'Veja informações sobre seu emprego atual!',
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const userId = interaction.user.id;

        const jobs = [
            { name: 'Gari', level: 1, salary: 100 },
            { name: 'Jornaleiro', level: 5, salary: 350 },
            { name: 'Sorveteiro', level: 15, salary: 600 },
            { name: 'Fotografo', level: 20, salary: 950 },
            { name: 'MotoBoy', level: 25, salary: 1100 },
            { name: 'Barman', level: 30, salary: 1375 },
            { name: 'Uber', level: 35, salary: 1550 },
            { name: 'Monza Rota Paraguai', level: 40, salary: 1850 },
            { name: 'Uber Black', level: 45, salary: 2000 },
            { name: 'Golpista', level: 50, salary: 2350 },
            { name: 'Aviãozinho', level: 60, salary: 2500 },
            { name: 'Mecânico', level: 70, salary: 3000 },
            { name: 'Bombeiro', level: 80, salary: 3400 },
            { name: 'Influencer', level: 90, salary: 3650 },
            { name: 'Assassino de Aluguel', level: 100, salary: 4000 },
            { name: 'Chefe de Boca', level: 120, salary: 4250 },
            { name: 'Advogado', level: 140, salary: 4650 },
            { name: 'Divulgador de Tigrinho', level: 160, salary: 5000 },
            { name: 'Policia', level: 180, salary: 5500 },
            { name: 'Motorista da BRINKS', level: 200, salary: 6200 },
            { name: 'Herdeiro da WEG', level: 300, salary: 10000 }
        ];

        // Consultar emprego do usuário no banco de dados
        db.get('SELECT job FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Erro ao consultar o banco:', err.message);
                return interaction.reply({ content: 'Erro ao acessar o banco de dados!', ephemeral: false });
            }

            if (!row || !row.job) {
                return interaction.reply({ content: 'Você não tem nenhum emprego atualmente.', ephemeral: false });
            }

            const job = jobs.find(j => j.name === row.job);

            if (!job) {
                return interaction.reply({ content: 'O emprego atual não está registrado corretamente.', ephemeral: false });
            }

            interaction.reply({
                content: `@${interaction.user.username}, seu emprego atual é **${job.name}** com o salário de **R$${job.salary.toFixed(2)}**.`,
                ephemeral: false
            });
        });
    }
};
