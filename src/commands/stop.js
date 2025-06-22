const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and disconnect'),
  async execute(interaction, client) {
    await interaction.deferReply();

    const player = client.shoukaku.getPlayer(interaction.guild.id);
    if (!player) {
      return interaction.editReply('No music is playing!');
    }

    try {
      await player.destroy();
      await interaction.editReply('Stopped music and disconnected!');
    } catch (error) {
      console.error(error);
      await interaction.editReply('Error stopping the music!');
    }
  },
};
