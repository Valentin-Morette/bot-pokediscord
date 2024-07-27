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
				? 'Il n y a pas de pokémon sauvage dans cette zone.'
				: 'Il n y a pas de zone de pêche dans cette zone.';
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
			.setTitle(`Un ${pokemon.name + star} sauvage apparaît !`)
			.setDescription('Attrapez-le !')
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
		.setTitle('🌟 Soutenez le serveur sur Buy Me a Coffee! 🌟')
		.setDescription(
			'Maintenir le bot actif implique des coûts. En offrant un café sur Buy Me a Coffee, vous aidez à couvrir ces frais et à continuer à fournir un jeu gratuit et de qualité. Chaque café compte! Merci pour votre soutien!  ☕'
		)
		.addFields({
			name: '🔗 Lien Buy Me a Coffee',
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
			"Besoin de jeux à petit prix? Instant Gaming propose des jeux PC, PS4, Xbox et bien d'autres à des prix imbattables. En achetant vos jeux via ce lien, vous soutenez le serveur et le bot. Merci pour votre soutien! 🎮"
		)
		.addFields({
			name: '🔗 Lien Instant Gaming',
			value: 'https://www.instant-gaming.com/?igr=seriousnintendo',
		})
		.setColor(color)
		.setThumbnail('https://seeklogo.com/images/I/instant-gaming-logo-5931E64B57-seeklogo.com.png');
	return { embed, attachment: null };
}

async function spawnPokemonWithRune(interaction) {
	const idTrainer = interaction.user.id;
	const pokemonName = interaction.options.getString('nom');
	try {
		const pokemon = await API.post(`/rune/use`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
		});
		if (pokemon.data.status === 'noRune') {
			return `Vous n'avez pas de rune de ${upFirstLetter(pokemonName)}.`;
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
			'Attrapez-le !',
			`Vous avez fait apparaître un ${pokemonSpawn.name + star}!`,
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
		return 'Vous devez entrer une quantité supérieur à 0.';
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
				'Il vous faut au minimum ' +
				pokemon.numberPokemon * pokemon.quantity +
				' ' +
				upFirstLetter(namePokemon) +
				' pour ' +
				(pokemon.quantity > 1 ? 'tous les' : 'le') +
				' faire évoluer.'
			);
		} else if (pokemon.status === 'evolve') {
			let star = pokemon.isShiny ? '✨' : '';
			const embed = new EmbedBuilder()
				.setTitle(
					`Vous avez fait évoluer ${pokemon.quantity * pokemon.pokemonPreEvolve.numberEvolution} ${
						upFirstLetter(namePokemon) + star
					} en ${pokemon.quantity} ${pokemon.pokemonEvolve.name + star} !`
				)
				.setDescription(
					'Félicitations ! Vous avez obtenu ' +
						pokemon.quantity +
						' nouveau' +
						(pokemon.quantity > 1 ? 'x ' : ' ') +
						pokemon.pokemonEvolve.name +
						star +
						'.'
				)
				.setThumbnail(pokemon.isShiny ? pokemon.pokemonEvolve.imgShiny : pokemon.pokemonEvolve.img)
				.setFooter({
					text: 'Evolution de ' + upFirstLetter(namePokemon),
				})
				.setTimestamp()
				.setColor(pokemon.isShiny ? '#ffed00' : '#FFFFFF');
			return { embeds: [embed] };
		} else if (pokemon.status === 'noEvolution') {
			return upFirstLetter(namePokemon) + " n'a pas d'évolution.";
		} else if (pokemon.status === 'noExistPokemon') {
			return upFirstLetter(namePokemon) + " n'est pas un pokémon.";
		} else if (pokemon.status === 'noMaster') {
			return upFirstLetter(namePokemon) + " ne peux pas évoluer si vous n'êtes pas un maître Pokémon.";
		} else {
			return "Erreur lors de l'évolution du pokémon.";
		}
	} catch (error) {
		console.error("Erreur lors de l'évolution du pokémon.");
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
			return `${upFirstLetter(namePokemon)} n'est pas un pokémon`;
		}

		let description = null;
		let title = '';

		// Evolution de Évoli
		if (pokemon.infos.id === 133) {
			title = `Il vous faut ${pokemon.infos.numberEvolution} ${upFirstLetter(
				namePokemon
			)} pour le faire évoluer.`;
			description =
				`\nZones d'évolution :\n` +
				`- Voltali : La centrale.\n` +
				`- Pyroli : La route de la victoire.\n` +
				`- Aquali : Les îles écume.\n` +
				`- Aléatoire : les autres zones.`;
		} else {
			title =
				pokemon.infos.numberEvolution === null
					? `${upFirstLetter(namePokemon)} ne peut pas évoluer.`
					: `Il vous faut ${pokemon.infos.numberEvolution} ${upFirstLetter(
							namePokemon
					  )} pour obtenir un ${upFirstLetter(pokemon.infos.evolution.name)}.`;
		}
		const footer = 'Nombre de ' + upFirstLetter(namePokemon);
		const embed = createListEmbed(description, title, footer, pokemon.infos.img);
		return { embeds: [embed] };
	} catch (error) {
		console.error("Le pokémon n'existe pas.");
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
					`Les Pokémon suivants sont disponibles ${spawnTypeTranslation(
						spawnType
					)} :\n- ${pokemonsBySpawnType[spawnType].join('\n- ')}.`
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
			return "dans l'herbe";
		case 'canne':
			return 'à la canne';
		case 'superCanne':
			return 'à la super canne';
		case 'megaCanne':
			return 'à la méga canne';
		default:
			return type;
	}
}

async function getZoneForPokemon(namePokemon) {
	try {
		const response = await API.get(`/zone/pokemon/${namePokemon}`);
		let zones = response.data;

		if (zones.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} n'est pas un pokémon.`;
		}

		let title =
			zones.result.length === 0
				? `${upFirstLetter(zones.pokemon.name)} est disponible seulement par évolution.`
				: `Liste des zones pour ${upFirstLetter(zones.pokemon.name)}`;

		let allZone = zones.result.map((zone) => `- ${upFirstLetter(zone.name)}`);

		if (namePokemon.toLowerCase() === 'mew') {
			title = 'Personne ne sait où se trouve Mew.';
			allZone = [];
		}

		const footer = upFirstLetter(zones.pokemon.name);
		const thumbnailUrl = zones.pokemon.img;

		let embed = createListEmbed(allZone, title, footer, thumbnailUrl, null, '#6B8E23');
		return { embeds: [embed] };
	} catch (error) {
		console.error("Erreur lors de l'obtention des zones.");
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
