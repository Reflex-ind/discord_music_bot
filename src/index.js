const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');
const Spotify = require('spotify-web-api-node');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.spotify = new Spotify({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Load Lavalink
const Nodes = [{
  name: 'local',
  url: process.env.LAVALINK_HOST || 'lavalink:2333',
  auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
}];

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
client.shoukaku = shoukaku;

shoukaku.on('error', (_, error) => console.error(error));
shoukaku.on('ready', (name) => console.log(`Lavalink ${name} ready!`));

// Load Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Client Events
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing the command!', ephemeral: true });
  }
});

// Spotify Token Refresh
async function refreshSpotifyToken() {
  try {
    const data = await client.spotify.clientCredentialsGrant();
    client.spotify.setAccessToken(data.body.access_token);
    setTimeout(refreshSpotifyToken, (data.body.expires_in - 300) * 1000);
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
  }
}

refreshSpotifyToken();

client.login(process.env.DISCORD_TOKEN);
