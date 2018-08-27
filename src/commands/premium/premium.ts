import { Message } from 'eris';
import moment from 'moment';

import { IMClient } from '../../client';
import { createEmbed, sendReply } from '../../functions/Messaging';
import { premiumSubscriptions, sequelize } from '../../sequelize';
import { BotCommand, CommandGroup } from '../../types';
import { Command, Context } from '../Command';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: BotCommand.premium,
			aliases: ['patreon', 'donate'],
			desc: 'Info about premium version.',
			group: CommandGroup.Premium,
			guildOnly: true
		});
	}

	public async action(
		message: Message,
		args: any[],
		{ guild, t, settings }: Context
	): Promise<any> {
		// TODO: Create list of premium features (also useful for FAQ)
		const lang = settings.lang;

		const embed = createEmbed(this.client);

		const isPremium = this.client.cache.isPremium(guild.id);

		if (!isPremium) {
			embed.title = t('cmd.premium.noPremium.title');
			embed.description = t('cmd.premium.noPremium.text');

			embed.fields.push({
				name: t('cmd.premium.feature.embeds.title'),
				value: t('cmd.premium.feature.embeds.text')
			});

			embed.fields.push({
				name: t('cmd.premium.feature.export.title'),
				value: t('cmd.premium.feature.export.text')
			});
		} else {
			const sub = await premiumSubscriptions.findOne({
				where: {
					guildId: guild.id,
					validUntil: {
						[sequelize.Op.gte]: new Date()
					}
				},
				raw: true
			});

			embed.title = t('cmd.premium.premium.title');

			let description = '';
			if (sub) {
				const date = moment(sub.validUntil)
					.locale(lang)
					.fromNow(true);
				description = t('cmd.premium.premium.text', {
					date
				});
			} else {
				description += t('cmd.premium.premium.notFound');
			}
			embed.description = description;
		}

		return sendReply(this.client, message, embed);
	}
}
