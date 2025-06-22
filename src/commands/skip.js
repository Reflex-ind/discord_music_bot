const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track'),
  async execute(interaction, client) {
    await interaction.deferReply();

    const player = client.shoukaku.getPlayer(interaction.guild.id);
    if (!player) {
      return interaction.editReply('No music is playing!');
    }

    try {
      await player.stopTrack();
      await interaction.editReply('Skipped the current track!');
    } catch (error) {
      console.error(error);
      await interaction.editReply('Error skipping the track!');
    }
  },
};
