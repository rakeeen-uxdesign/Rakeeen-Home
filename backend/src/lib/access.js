import { CONTROL_CHANNEL_ID } from '../config.js';

/**
 * This isn't optional hardening — the cards this bot posts are regular
 * (non-ephemeral) messages, so anyone who can see the control channel can
 * click their buttons, not just whoever ran the slash command. Checked on
 * every interaction (commands, buttons, modals), not just at registration
 * time, since Discord's own command-visibility settings are advisory and
 * don't stop a click on an already-posted message.
 *
 * The authorized user is whoever owns the server — no extra config, no user
 * ID to collect and keep in sync by hand.
 */
export async function isAuthorized(interaction) {
  if (interaction.channelId !== CONTROL_CHANNEL_ID) return false;
  if (!interaction.guildId) return false; // no DMs
  const guild = interaction.guild ?? await interaction.client.guilds.fetch(interaction.guildId).catch(() => null);
  if (!guild) return false;
  return interaction.user.id === guild.ownerId;
}
