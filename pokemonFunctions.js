import { ActionRowBuilder, ButtonStyle, EmbedBuilder, ButtonBuilder } from 'discord.js';
import { upFirstLetter, createListEmbed, API, correctNameZone } from './globalFunctions.js';

let commandCount = 0;
let embedIndex = 0;

const embedFunctions = [buyMeACoffeeEmbed, instantGamingEmbed];

async function findRandomPokemon(interaction, type, followUp = false) {
	commandCount++;
	try {
		const randomPokemon = await API.post(`/pokemon/wild`, {
			nameZone: correctNameZone(interaction.channel.name),
			spawnType: type,
		});
		if (randomPokemon.data.length === 0) {
			return type === 'herbe'
				? 'There are no wild Pokemon in this area.'
				: 'There is no fishing spot in this area.';
		}
		let pokemon = randomPokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemon.idPokemonWild + '|' + type)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

			row.addComponents(button);
		});
		let star = pokemon.isShiny ? '✨' : '';
		const color = pokemon.isShiny ? '#ffed00' : '#FFFFFF';
		const embed = new EmbedBuilder()
			.setTitle(`A wild ${pokemon.name + star} appears!`)
			.setDescription('Catch it!')
			.setThumbnail(pokemon.isShiny ? pokemon.imgShiny : pokemon.img)
			.setColor(color);

		const responseOptions = {
			embeds: [embed],
			components: [row],
		};

		if (commandCount % 50 === 0) {
			const { embed: extraEmbed, attachment: extraAttachment } =
				embedFunctions[embedIndex % embedFunctions.length](color);
			responseOptions.embeds.push(extraEmbed);
			if (extraAttachment) {
				if (!responseOptions.files) responseOptions.files = [];
				responseOptions.files.push(extraAttachment);
			}
			embedIndex++;
		}

		if (followUp) {
			await interaction.followUp(responseOptions);
		} else {
			return responseOptions;
		}
	} catch (error) {
		console.error(error);
	}
}

function buyMeACoffeeEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle('🌟 Support the server on Buy Me a Coffee! 🌟')
		.setDescription(
			'Keeping the bot active comes with costs. By buying a coffee on Buy Me a Coffee, you help cover these expenses and continue providing a free and quality game. Every coffee counts! Thank you for your support! ☕'
		)
		.addFields({
			name: '🔗 Buy Me a Coffee Link',
			value: 'https://buymeacoffee.com/birious',
		})
		.setColor(color)
		.setThumbnail(
			'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGI4ZWsxaWl2MTc1enF1cnZ4cnAydWlraWFpMXl2bXg2dTc3bGxyZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/TDQOtnWgsBx99cNoyH/giphy.gif'
		);
	return { embed, attachment: null };
}

function instantGamingEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle('🎮 Instant Gaming 🎮')
		.setDescription(
			'Looking for games at low prices? Instant Gaming offers PC, PS4, Xbox games, and many more at unbeatable prices. By purchasing your games through this link, you support the server and the bot. Thank you for your support! 🎮'
		)
		.addFields({
			name: '🔗 Instant Gaming Link',
			value: 'https://www.instant-gaming.com/?igr=seriousnintendo',
		})
		.setColor(color)
		.setThumbnail('https://seeklogo.com/images/I/instant-gaming-logo-5931E64B57-seeklogo.com.png');
	return { embed, attachment: null };
}

async function spawnPokemonWithRune(interaction) {
	const idTrainer = interaction.user.id;
	const pokemonName = interaction.options.getString('name');
	try {
		const pokemon = await API.post(`/rune/use`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
		});
		if (pokemon.data.status === 'noRune') {
			return `You don't have a rune for ${upFirstLetter(pokemonName)}.`;
		}
		let pokemonSpawn = pokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemonSpawn.idPokemonWild)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

			row.addComponents(button);
		});
		let img = pokemonSpawn.isShiny ? pokemonSpawn.imgShiny : pokemonSpawn.img;
		let star = pokemonSpawn.isShiny ? '✨' : '';
		const embed = createListEmbed(
			'Catch it!',
			`You have spawned a ${pokemonSpawn.name + star}!`,
			null,
			img,
			null,
			'#9f53ec'
		);

		return {
			embeds: [embed],
			components: [row],
		};
	} catch (error) {
		console.error(error);
	}
}

async function evolvePokemon(idTrainer, namePokemon, nameZone, quantity, isShiny, max = false) {
	quantity = quantity == null && !max ? 1 : quantity;
	if (quantity < 1 && !max) {
		return 'You must enter a quantity greater than 0.';
	}
	if (max && quantity != null) {
		max = false;
	}
	try {
		const evolvePokemon = await API.post(`/pokemon/evolve`, {
			namePokemon: namePokemon,
			idTrainer: idTrainer,
			nameZone: correctNameZone(nameZone),
			isShiny: isShiny,
			quantity: quantity,
			max: max,
		});
		const pokemon = evolvePokemon.data;
		if (pokemon.status === 'noPokemon') {
			return (
				'You need at least ' +
				pokemon.numberPokemon * pokemon.quantity +
				' ' +
				upFirstLetter(namePokemon) +
				' to evolve ' +
				(pokemon.quantity > 1 ? 'all of them' : 'it') +
				'.'
			);
		} else if (pokemon.status === 'evolve') {
			let star = pokemon.isShiny ? '✨' : '';
			const embed = new EmbedBuilder()
				.setTitle(
					`You have evolved ${pokemon.quantity * pokemon.pokemonPreEvolve.numberEvolution} ${
						upFirstLetter(namePokemon) + star
					} into ${pokemon.quantity} ${pokemon.pokemonEvolve.name + star}!`
				)
				.setDescription(
					'Congratulations! You have obtained ' +
						pokemon.quantity +
						' new ' +
						(pokemon.quantity > 1 ? 'ones' : '') +
						pokemon.pokemonEvolve.name +
						star +
						'.'
				)
				.setThumbnail(pokemon.isShiny ? pokemon.pokemonEvolve.imgShiny : pokemon.pokemonEvolve.img)
				.setFooter({
					text: 'Evolution of ' + upFirstLetter(namePokemon),
				})
				.setTimestamp()
				.setColor(pokemon.isShiny ? '#ffed00' : '#FFFFFF');
			return { embeds: [embed] };
		} else if (pokemon.status === 'noEvolution') {
			return upFirstLetter(namePokemon) + ' has no evolution.';
		} else if (pokemon.status === 'noExistPokemon') {
			return upFirstLetter(namePokemon) + ' is not a Pokemon.';
		} else if (pokemon.status === 'noMaster') {
			return upFirstLetter(namePokemon) + ' cannot evolve unless you are a Pokemon master.';
		} else {
			return "Error during the Pokemon's evolution.";
		}
	} catch (error) {
		console.error("Error during the Pokemon's evolution.");
	}
}

async function clearOldWildPokemon() {
	try {
		await API.delete(`/pokemon/wild`);
	} catch (error) {
		console.error(error);
	}
}

async function nbPokemon(namePokemon) {
	try {
		const response = await API.post(`/pokemon/info`, { namePokemon });
		let pokemon = response.data;

		if (pokemon.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} is not a Pokemon`;
		}

		let description = null;
		let title = '';

		// Evolution de Évoli
		if (pokemon.infos.id === 133) {
			title = `You need ${pokemon.infos.numberEvolution} ${upFirstLetter(namePokemon)} to evolve it.`;
			description =
				`\nEvolution zones:\n` +
				`- Jolteon: The Power Plant.\n` +
				`- Flareon: Victory Road.\n` +
				`- Vaporeon: The Seafoam Islands.\n` +
				`- Random: other zones.`;
		} else {
			title =
				pokemon.infos.numberEvolution === null
					? `${upFirstLetter(namePokemon)} cannot evolve.`
					: `You need ${pokemon.infos.numberEvolution} ${upFirstLetter(
							namePokemon
					  )} to obtain a ${upFirstLetter(pokemon.infos.evolution.name)}.`;
		}
		const footer = 'Number of ' + upFirstLetter(namePokemon);
		const embed = createListEmbed(description, title, footer, pokemon.infos.img);
		return { embeds: [embed] };
	} catch (error) {
		console.error('The Pokemon does not exist.');
	}
}

async function getAvailable(channelName) {
	try {
		const response = await API.post(`/pokemon/zone`, {
			nameZone: correctNameZone(channelName),
		});

		const pokemonsBySpawnType = response.data.reduce((acc, pokemon) => {
			if (!acc[pokemon.spawnType]) {
				acc[pokemon.spawnType] = [];
			}
			acc[pokemon.spawnType].push(pokemon.name);
			return acc;
		}, {});

		const spawnOrder = ['herbe', 'canne', 'superCanne', 'megaCanne'];
		const messages = [];

		for (const spawnType of spawnOrder) {
			if (pokemonsBySpawnType[spawnType]) {
				messages.push(
					`The following Pokemon are available ${spawnTypeTranslation(
						spawnType
					)}:\n- ${pokemonsBySpawnType[spawnType].join('\n- ')}.`
				);
			}
		}

		return messages.join('\n\n');
	} catch (error) {
		console.error(error);
	}
}

function spawnTypeTranslation(type) {
	switch (type) {
		case 'herbe':
			return 'in the grass';
		case 'canne':
			return 'with the rod';
		case 'superCanne':
			return 'with the super rod';
		case 'megaCanne':
			return 'with the mega rod';
		default:
			return type;
	}
}

async function getZoneForPokemon(namePokemon) {
	try {
		const response = await API.get(`/zone/pokemon/${namePokemon}`);
		let zones = response.data;

		if (zones.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} is not a Pokemon.`;
		}

		let title =
			zones.result.length === 0
				? `${upFirstLetter(zones.pokemon.name)} is only available through evolution.`
				: `List of zones for ${upFirstLetter(zones.pokemon.name)}`;

		let allZone = zones.result.map((zone) => `- ${upFirstLetter(zone.name)}`);

		if (namePokemon.toLowerCase() === 'mew') {
			title = 'No one knows where Mew is.';
			allZone = [];
		}

		const footer = upFirstLetter(zones.pokemon.name);
		const thumbnailUrl = zones.pokemon.img;

		let embed = createListEmbed(allZone, title, footer, thumbnailUrl, null, '#6B8E23');
		return { embeds: [embed] };
	} catch (error) {
		console.error('Error retrieving zones.');
	}
}

export {
	findRandomPokemon,
	evolvePokemon,
	clearOldWildPokemon,
	nbPokemon,
	getAvailable,
	getZoneForPokemon,
	spawnPokemonWithRune,
};
