const Discord = require('discord.js');
const db = require('../../database/database'); // Importa o banco de dados
const cor = require('../../config').discord.color;

// Lista de empregos disponíveis
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

module.exports = {
    name: 'jobs',
    description: 'Escolha um emprego!',
    type: 1,

    run: async (client, interaction) => {
        const userId = interaction.user.id;

        // Consultar nível do usuário
        db.get('SELECT level FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Erro ao consultar o banco:', err.message);
                return interaction.reply({ content: 'Erro ao acessar o banco de dados!', ephemeral: false });
            }

            const userLevel = row ? row.level : 1; // Nível padrão = 1

            // Configurar o select menu
            const options = jobs.map(job => ({
                label: `${job.name}`,
                description: `Level necessário ${job.level} - R$${job.salary.toFixed(2)}`,
                value: job.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                disabled: job.level > userLevel // Desabilitar empregos acima do nível do usuário
            }));

            const selectMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('job_select')
                .setPlaceholder('Selecione um emprego')
                .addOptions(options);

            const embed = new Discord.EmbedBuilder()
                .setColor(cor)
                .setTitle('Agência de Empregos')
                .setDescription('💼 | Escolha um emprego')
                .setFooter({ text: `Seu nível atual: ${userLevel}` });

            const actionRow = new Discord.ActionRowBuilder().addComponents(selectMenu);

            interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: false });

            // Event listener para o select menu
            const collector = interaction.channel.createMessageComponentCollector({
                componentType: Discord.ComponentType.StringSelect,
                time: 60000
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: 'Você não pode interagir com este menu.', ephemeral: false });
                }

                const selectedJobValue = i.values[0];

                // Encontrar o emprego selecionado
                const selectedJob = jobs.find(job =>
                    job.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') === selectedJobValue
                );

                if (!selectedJob) {
                    return i.reply({ content: 'Emprego selecionado inválido.', ephemeral: false });
                }

                // Verificar se o nível do usuário é suficiente
                if (selectedJob.level > userLevel) {
                    return i.reply({ content: 'Você não tem nível para este trampo.', ephemeral: false });
                }

                // Atualizar emprego do usuário no banco de dados
                db.run('UPDATE users SET job = ? WHERE id = ?', [selectedJob.name, userId], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar o emprego:', updateErr.message);
                        return i.reply({ content: 'Erro ao salvar seu emprego!', ephemeral: false });
                    }

                    i.reply({ content: `:briefcase: | Você aderiu à profissão de **${selectedJob.name}**, Use: **/info trabalho** para obter mais informações.`, ephemeral: false });
                });

                collector.stop();
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Você não escolheu nenhum emprego.', components: [] });
                }
            });
        });
    }
};
