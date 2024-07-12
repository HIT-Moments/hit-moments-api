const { Client, GatewayIntentBits } = require('discord.js');

const env = require('./env.config');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const discordToken = env.discordToken;
const discordChannelId = env.discordChannelId;

client.login(discordToken);

module.exports = {
  client,
  discordChannelId,
};
