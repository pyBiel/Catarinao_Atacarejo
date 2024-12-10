const Discord = require('discord.js');
const db = require('../../database/database'); // Banco de dados
const cor = require('../../config').discord.color;

const COOLDOWN_TIME = 3600000; // 1 hora em milissegundos

module.exports = {
    name: 'job',
    description: 'Trabalhe no seu emprego atual e ganhe dinheiro e XP!',
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Buscar trabalho atual e verificar cooldown
        db.get('SELECT job, wallet, experience, last_work_time FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Erro ao acessar o banco:', err.message);
                return interaction.reply({ content: 'Erro ao acessar o banco de dados!', ephemeral: false });
            }

            if (!row || !row.job) {
                return interaction.reply({
                    content: 'Você não tem um trabalho! Use o comando `/jobs` para escolher um emprego.',
                    ephemeral: false
                });
            }

            const now = Date.now();
            const lastWorkTime = row.last_work_time || 0;

            if (now - lastWorkTime < COOLDOWN_TIME) {
                const remainingTime = COOLDOWN_TIME - (now - lastWorkTime);
                const minutes = Math.floor(remainingTime / 60000);
                const seconds = Math.floor((remainingTime % 60000) / 1000);

                return interaction.reply({
                    content: `:alarm_clock: | Você poderá trabalhar novamente em ${minutes} minutos e ${seconds} segundos.`,
                    ephemeral: false
                });
            }

            const job = jobs.find(j => j.name === row.job);

            if (!job) {
                return interaction.reply({
                    content: 'O trabalho atual não está registrado corretamente. Use `/jobs` para corrigir.',
                    ephemeral: false
                });
            }

            // Dinheiro e XP ganhos
            const salary = job.salary;
            const xpGain = Math.floor(salary / 10); // Exemplo: XP é 10% do salário

            // Atualizar banco de dados
            db.run(
                'UPDATE users SET wallet = ?, experience = ?, last_work_time = ? WHERE id = ?',
                [row.wallet + salary, row.experience + xpGain, now, userId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar o banco:', updateErr.message);
                        return interaction.reply({ content: 'Erro ao salvar os dados no banco.', ephemeral: false });
                    }

                    // Enviar embed com os resultados
                    const embed = new Discord.EmbedBuilder()
                        .setColor(cor)
                        .setTitle(job.name)
                        .setDescription(':dollar: | Você trabalhou de **' + job.name + '** e faturou **R$' + salary.toFixed(2) + '** e mais **' + xpGain + '** de XP.')
                        .addFields({
                            name: ':alarm_clock: | Próximo Trabalho',
                            value: 'Você poderá trabalhar novamente em 1 hora.',
                            inline: false
                        })
                        .setFooter({ text: `Comando usado por ${interaction.user.username}` });

                    interaction.reply({ embeds: [embed] });
                }
            );
        });
    }
};

// Lista de empregos reutilizada
const jobs = [
    { name: 'Gari', level: 1, salary: 100000 },
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
