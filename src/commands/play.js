const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType } = require('shoukaku');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a Spotify playlist or album')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Spotify playlist or album URL')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply();

    const url = interaction.options.getString('url');
    const member = interaction.member;

    if (!member.voice.channel) {
      return interaction.editReply('You need to be in a voice channel!');
    }

    let queryType = null;
    if (url.includes('playlist')) {
      queryType = QueryType.SPOTIFY_PLAYLIST;
    } else if (url.includes('album')) {
      queryType = QueryType.SPOTIFY_ALBUM;
    } else {
      return interaction.editReply('Please provide a valid Spotify playlist or album URL!');
    }

    try {
      const node = client.shoukaku.getNode();
      const result = await node.rest.resolve(`${url}`);

      if (!result || !result.tracks.length) {
        return interaction.editReply('No tracks found!');
      }

      const player = await node.joinChannel({
        guildId: interaction.guild.id,
        channelId: member.voice.channel.id,
        shardId: interaction.guild.shardId,
      });

      for (const track of result.tracks) {
        player.playTrack(track);
      }

      const embed = new EmbedBuilder()
        .setColor('#1DB954')
        .setTitle('Added to Queue')
        .setDescription(`Loaded ${result.tracks.length} tracks from ${result.data.name}`)
        .setThumbnail(result.data.cover);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Error playing the Spotify URL!');
    }
  },
};
