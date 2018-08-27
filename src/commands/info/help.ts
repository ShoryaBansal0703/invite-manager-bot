import { Message } from 'eris';

import { IMClient } from '../../client';
import { createEmbed, sendReply } from '../../functions/Messaging';
import { CommandResolver } from '../../resolvers';
import { BotCommand, CommandGroup } from '../../types';
import { Command, Context } from '../Command';

const config = require('../../../config.json');

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: BotCommand.help,
			aliases: [],
			args: [
				{
					name: 'command',
					description: 'The command to get detailed information for',
					resolver: CommandResolver
				}
			],
			desc: 'Display help',
			group: CommandGroup.Info,
			guildOnly: false
		});
	}

	public async action(
		message: Message,
		[command]: [Command],
		context: Context
	): Promise<any> {
		const { guild, t, settings } = context;
		const embed = createEmbed(this.client);

		const prefix = settings ? settings.prefix : '!';

		if (command) {
			const cmd = {
				...command,
				usage: command.usage.replace('<prefix>', prefix),
				info: command.getInfo(context)
			};

			embed.fields.push({
				name: t('cmd.help.command.title'),
				value: cmd.name,
				inline: true
			});
			embed.fields.push({
				name: t('cmd.help.description.title'),
				value: cmd.description,
				inline: true
			});
			embed.fields.push({
				name: t('cmd.help.usage.title'),
				value: '`' + cmd.usage + '`\n\n' + cmd.info
			});
			if (cmd.aliases.length > 0) {
				embed.fields.push({
					name: t('cmd.help.aliases.title'),
					value: cmd.aliases.join(', '),
					inline: true
				});
			}
		} else {
			let member = guild.members.get(message.author.id);
			if (!member) {
				member = await guild.getRESTMember(message.author.id);
			}

			embed.description = t('cmd.help.text', { prefix }) + '\n\n';

			const commands = this.client.commands
				.filter(c => !c.ownerOnly && !c.hidden)
				.map(c => ({
					...c,
					usage: c.usage.replace('<prefix>', prefix)
				}))
				.sort((a, b) => a.name.localeCompare(b.name));

			Object.keys(CommandGroup).forEach(group => {
				const cmds = commands.filter(c => c.group === group);
				if (cmds.length === 0) {
					return;
				}

				let descr = '';
				descr += cmds.map(c => '`' + c.name + '`').join(', ');
				embed.fields.push({ name: group, value: descr });
			});

			/*if (guild && member && member.permission.has('ADMINISTRATOR')) {
				const unavailableCommands = commands.filter(
					c => !me.permission.has(c.clientPermissions)
				);

				if (unavailableCommands.length > 0) {
					let unavailableDescription = '';
					unavailableCommands.forEach(c => {
						const missingPermission = c.clientPermissions.find(cp => {
							return !botMember.hasPermission(cp);
						});
						unavailableDescription +=
							rp.CMD_HELP_UNAVAILABLE_COMMAND({
								prefix,
								name: c.name,
								missingPermission
							}) + '\n';
					});
					embed.fields.push(
						t('CMD_HELP_UNAVAILABLE_COMMAND_TITLE'),
						unavailableDescription
					);
				}
			}*/
		}

		let linksArray = [];
		if (config.botSupport) {
			linksArray.push(
				`[${t('bot.supportDiscord.title')}](${config.botSupport})`
			);
		}
		if (config.botAdd) {
			linksArray.push(`[${t('bot.invite.title')}](${config.botAdd})`);
		}
		if (config.botWebsite) {
			linksArray.push(`[${t('bot.website.title')}](${config.botWebsite})`);
		}
		if (config.botPatreon) {
			linksArray.push(`[${t('bot.patreon.title')}](${config.botPatreon})`);
		}

		embed.fields.push({
			name: t('cmd.help.links'),
			value: linksArray.join(` | `)
		});

		return sendReply(this.client, message, embed);
	}
}
