import {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	AttachmentBuilder,
} from 'discord.js';
import { upFirstLetter, formatNombreAvecSeparateur, createListEmbed, API } from './globalFunctions.js';
import { balls } from './variables.js';
import { findRandomPokemon } from './pokemonFunctions.js';

async function addTrainer(member) {
	try {
		const response = await API.get(`/trainer/verify/` + member.id);
		if (!response.data.hasAccount) {
			await API.post(`/trainer`, {
				trainer: {
					idDiscord: member.id,
					name: member.user.username,
					money: 2500,
				},
				ball: [
					{
						id: 1,
						quantity: 50,
					},
				],
			});
		}
	} catch (error) {
		console.error(error);
	}
}

async function catchPokemon(idPokemonWild, idTrainer, idPokeball) {
	try {
		const catchPokemon = await API.post(`/pokemon/catch`, {
			idPokemonWild: idPokemonWild,
			idTrainer: idTrainer,
			idBall: idPokeball,
		});
		return catchPokemon.data;
	} catch (error) {
		console.error(error);
	}
}

async function sellPokemon(idTrainer, namePokemon, quantity, isShiny, max = false) {
	try {
		quantity = quantity == null && !max ? 1 : quantity;
		if (max && quantity != null) {
			max = false;
		}
		if (quantity <= 0 && !max) {
			return "Vous ne pouvez pas vendre moins d'un pokémon.";
		}
		const sellPokemon = await API.post(`/pokemon/sell`, {
			namePokemon: namePokemon,
			idTrainer: idTrainer,
			quantity: quantity,
			isShiny: isShiny,
			max: max,
		});
		if (sellPokemon.data.status === 'noPokemon') {
			return "Vous n'avez pas " + sellPokemon.data.quantity + ' ' + namePokemon + '.';
		} else if (sellPokemon.data.status === 'sell') {
			return (
				'Vous avez vendu ' +
				sellPokemon.data.quantity +
				' ' +
				namePokemon +
				hasStar(isShiny) +
				' pour ' +
				sellPokemon.data.sellPrice +
				' pokédollars.'
			);
		} else if (sellPokemon.data.status === 'noExistPokemon') {
			return namePokemon + " n'est pas un pokémon.";
		}
	} catch (error) {
		console.error("Erreur lors de la vente d'un pokémon.");
	}
}

async function getBallTrainer(interaction) {
	let user = interaction.options.getUser('dresseur') ?? interaction.user;
	try {
		const response = await API.get(`/pokeball/trainer/` + interaction.member.id);
		const arrResponse = [];
		for (let i = 0; i < response.data.length; i++) {
			const customEmoji = interaction.guild.emojis.cache.find(
				(emoji) => emoji.name === response.data[i].name
			);
			arrResponse.push(
				'- ' + (customEmoji ? customEmoji.toString() : '') + ' : ' + response.data[i].quantity
			);
		}
		const footer = 'Liste des pokéballs de ' + interaction.member.user.username;
		const thumbnailUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
		const embed = createListEmbed(arrResponse, 'Vos pokéballs :', footer, thumbnailUrl, null, '#E31030');
		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function getPokedex(interaction, type) {
	let user = interaction.options.getUser('dresseur') ?? interaction.user;
	let sameUser = user.id !== interaction.user.id;
	try {
		const response = await API.get(`/pokemon/trainer/` + user.id + '/' + type);
		const pokemons = response.data.pokemon;
		if (pokemons.length === 0) {
			return (
				`${sameUser ? `${user.globalName} n'a` : `Vous n'avez`} pas encore de pokémon` +
				(type === 'shiny' ? ' shiny' : '') +
				'.'
			);
		}

		const items = pokemons.map((pokemon) => `- ${pokemon.quantity} ${pokemon.name}`);
		const title = `${sameUser ? `${user.globalName} a` : 'Vous avez'} ${
			response.data.sumPokemon
		} pokémon${hasStar(type === 'shiny')}, dont ${response.data.countPokemon} différents.`;
		const footer =
			(type === 'shiny' ? 'Shiny' : 'Poke') +
			'dex de ' +
			user.globalName +
			' - ' +
			response.data.countPokemon +
			'/151';
		const thumbnailUrl = user.displayAvatarURL({ format: 'png', dynamic: true });

		let embed = createListEmbed(
			items,
			title,
			footer,
			thumbnailUrl,
			null,
			type === 'shiny' ? '#FFED00' : '#FF0000'
		);

		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function getMoney(idTrainer) {
	try {
		const response = await API.get(`/trainer/` + idTrainer);
		return 'Vous avez : ' + formatNombreAvecSeparateur(response.data.money) + ' pokédollars.';
	} catch (error) {
		console.error(error);
	}
}

async function priceBall(idBall) {
	try {
		const response = await API.get(`/pokeball/` + idBall);
		return `Le prix d'une ${upFirstLetter(response.data.name)} est de ${formatNombreAvecSeparateur(
			response.data.buyingPrice
		)} pokédollars.`;
	} catch (error) {
		console.error("La pokéball n'existe pas.");
	}
}

async function pricePokemon(namePokemon, isRune = false) {
	try {
		const response = await API.post(`/pokemon/info`, {
			namePokemon: namePokemon,
		});
		let pokemon = response.data;
		if (isRune && pokemon.infos.catchRate === -100) {
			return `${upFirstLetter(
				namePokemon
			)} n'est pas un pokémon achetable, car il n'est pas disponible à l'état sauvage.`;
		}
		const sellPrice = isRune ? pokemon.infos.sellPrice * 3 : pokemon.infos.sellPrice;
		if (pokemon.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} n'est ${
				isRune ? 'pas un pokémon' : 'ni un pokémon, ni une pokeball'
			}.`;
		} else {
			return `Le prix de vente ${isRune ? "d'une rune de" : "d'un"} ${upFirstLetter(
				namePokemon
			)} est de ${formatNombreAvecSeparateur(sellPrice)} pokédollars. ${isRune ? '' : '(x3 en shiny)'}`;
		}
	} catch (error) {
		console.error("Le pokémon n'existe pas.");
	}
}

async function getPrice(item) {
	const isPokeball = balls.some((ball) => ball.name === item);
	if (isPokeball) {
		const ball = balls.find((ball) => ball.name === item);
		return await priceBall(ball.id);
	} else {
		return await pricePokemon(item);
	}
}

async function buyBall(idTrainer, idBall, quantity, nameBall) {
	try {
		const response = await API.post(`/pokeball/buy`, {
			idDiscord: idTrainer,
			idBall: idBall,
			quantity: quantity,
		});
		if (response.data.status === 'noMoney') {
			return "Vous n'avez pas assez d'argent.";
		} else if (response.data.status === 'buy') {
			return (
				'Vous avez acheté ' +
				quantity +
				' ' +
				upFirstLetter(nameBall) +
				' pour ' +
				formatNombreAvecSeparateur(response.data.price) +
				' pokédollars.'
			);
		}
	} catch (error) {
		console.error(error);
	}
}

async function getBadge(message, nbPokemon, nbPokemonDiff, nameBadge, roleBadge) {
	let idTrainer = message.member.id;
	try {
		const response = await API.get(`/pokemon/trainer/` + idTrainer + '/regular');
		if (response.data.sumPokemon < nbPokemon) {
			return `Vous n'avez pas assez de pokémon pour obtenir le badge ${nameBadge}.`;
		}
		if (response.data.countPokemon < nbPokemonDiff) {
			return `Vous n'avez pas assez de pokémon différents pour obtenir le badge ${nameBadge}.`;
		}
		let badgeRole = message.guild.roles.cache.find((role) => role.name === roleBadge);

		if (badgeRole) {
			if (message.member.roles.cache.has(badgeRole.id)) {
				return `Vous avez déjà le badge ${nameBadge}.`;
			}
			message.member.roles.add(badgeRole).catch(console.error);
			return `Vous avez reçu le badge ${nameBadge} !`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function handleCatch(interaction, idPokeball) {
	const idPokemonWild = interaction.customId.split('|')[1];
	const type = interaction.customId.split('|')[2];
	const idTrainer = interaction.user.id;
	const response = await catchPokemon(idPokemonWild, idTrainer, idPokeball);
	let replyMessage;
	let components;

	const originalEmbed = interaction.message.embeds[0];
	const newEmbed = new EmbedBuilder()
		.setTitle(originalEmbed.title)
		.setThumbnail(originalEmbed.thumbnail?.url);

	let addFieldsValue = originalEmbed.fields[0]?.value ?? '0';

	switch (response.status) {
		case 'noCatch':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `Le ${response.pokemonName} est resorti, retentez votre chance !`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			break;
		case 'catch':
			if (response.sendTuto) {
				sendSecondaryTutorialMessage(interaction);
			}
			newEmbed.setColor('#3aa12f');
			replyMessage = `Le ${response.pokemonName} a été capturé par <@${interaction.user.id}>.`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			components = await disabledButtons(interaction);
			break;
		case 'escape':
			newEmbed.setColor('#c71a28');
			replyMessage = `Le ${response.pokemonName} s'est échappé !`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			components = await disabledButtons(interaction);
			break;
		case 'alreadyCatch':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `Le Pokémon a déjà été capturé.`;
			break;
		case 'alreadyEscape':
			replyMessage = `Le Pokémon s'est déjà échappé.`;
			break;
		case 'noBall':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `Vous n'avez pas de ${balls.find((ball) => ball.id === idPokeball).name}.`;
			break;
		case 'noExistPokemon':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `Le pokémon a disparu.`;
			components = await disabledButtons(interaction);
			break;
		default:
			replyMessage = 'Une erreur inattendue s’est produite.';
	}

	newEmbed.setDescription(replyMessage);
	newEmbed.addFields({ name: 'Tentatives', value: addFieldsValue.toString(), inline: true });

	interaction.update({ embeds: [newEmbed], components });

	if (response.status !== 'noCatch' && response.status !== 'noBall') {
		setTimeout(() => findRandomPokemon(interaction, type, true), 800);
	} else if (response.status === 'noBall') {
		setTimeout(() => shopMessage(interaction), 800);
	}
}

async function shopMessage(interaction) {
	const channel = interaction.channel;
	console.log(channel.name);

	const attachment = new AttachmentBuilder(`./assets/shop.png`);

	const pokeballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'pokeball');
	const superballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'superball');
	const hyperballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'hyperball');
	const masterballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'masterball');

	const priceEmbed = new EmbedBuilder()
		.setColor('#FFFFFF')
		.setTitle("Vous n'avez pas de pokéball ?! Pas de problème !")
		.setDescription(
			`${pokeballEmoji} Pokéball : 50 $\n\n` +
				`${superballEmoji} Superball : 80 $\n\n` +
				`${hyperballEmoji} Hyperball : 150 $\n\n` +
				`${masterballEmoji} Masterball : 100 000 $\n\n`
		)
		.setThumbnail(`attachment://shop.png`);
	await channel.send({ embeds: [priceEmbed], files: [attachment] });

	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
	for (let i = 1; i <= 100; i *= 10) {
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId('buy|' + i + '|' + ball)
				.setStyle(ButtonStyle.Secondary)
				.setLabel('' + i)
				.setEmoji(customEmoji.id);

			row.addComponents(button);
		});
		await channel.send({ components: [row] });
	}
}

async function sendSecondaryTutorialMessage(interaction) {
	const shopChannel = interaction.guild.channels.cache.find(
		(channel) => channel.name === '🛒・𝐁𝐨𝐮𝐭𝐢𝐪𝐮𝐞'
	);
	const commandChannel = interaction.guild.channels.cache.find(
		(channel) => channel.name === '🧾・𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬'
	);
	const title = '🎉 Premier Pokémon capturé ! 🎉';
	const footer = 'Tutoriel - 2/2';
	const description =
		`Vous pouvez voir vos pokémons capturés en tapant **\`/pokedex\`** dans n'importe quel channel.\n\n` +
		`Vous avez utilisé des pokéballs, allez dans le channel <#${shopChannel.id}> pour en acheter.\n\n` +
		`Pour voir la liste de vos pokéballs, tapez **\`/ball\`**.\n` +
		`Pour voir votre argent, tapez **\`/argent\`**.\n\n` +
		`Pour consulter la liste des commandes, allez dans le channel <#${commandChannel.id}>.`;

	const tutorialEmbed = createListEmbed(description, title, footer, null, null, '#0099ff');

	await interaction.user.send({ embeds: [tutorialEmbed] });
}

async function disabledButtons(interaction) {
	let newRow = new ActionRowBuilder();
	interaction.message.components[0].components.forEach((button) => {
		const newButton = new ButtonBuilder()
			.setCustomId(button.customId)
			.setEmoji(button.emoji)
			.setStyle(button.style)
			.setDisabled(true);

		newRow.addComponents(newButton);
	});

	return [newRow];
}

function hasStar(isShiny) {
	return isShiny ? '✨' : '';
}

async function purposeSwapPokemon(interaction) {
	const pokemonPropose = interaction.options.getString('nom_pokemon_propose');
	const pokemonRequest = interaction.options.getString('nom_pokemon_demande');
	const quantityPokemonPropose = interaction.options.getInteger('quantité_pokemon_propose');
	const quantityPokemonRequest = interaction.options.getInteger('quantité_pokemon_demande');
	const pokemonProposeShiny = interaction.options.getString('pokemon_propose_shiny') === 'true';
	const pokemonRequestShiny = interaction.options.getString('pokemon_demande_shiny') === 'true';
	if (quantityPokemonPropose <= 0 || quantityPokemonRequest <= 0) {
		return 'Vous devez proposer/demander au moins un pokémon.';
	}
	try {
		const response = await API.post(`/trainer/pokemon/trade`, {
			idTrainer: interaction.user.id,
			pokemonPropose: pokemonPropose,
			pokemonRequest: pokemonRequest,
			quantityPokemonPropose: quantityPokemonPropose,
			quantityPokemonRequest: quantityPokemonRequest,
			pokemonProposeShiny: pokemonProposeShiny,
			pokemonRequestShiny: pokemonRequestShiny,
			type: 'propose',
		});
		if (response.data.status === 'not enough pokemon propose') {
			return `Vous n'avez pas assez de ${upFirstLetter(pokemonPropose) + hasStar(pokemonProposeShiny)}.`;
		} else if (response.data.status === 'not found pokemon propose') {
			return `${upFirstLetter(pokemonPropose)} n'est pas un pokémon.`;
		} else if (response.data.status === 'not found pokemon request') {
			return `${upFirstLetter(pokemonRequest)} n'est pas un pokémon.`;
		}

		let row = new ActionRowBuilder();

		const button = new ButtonBuilder()
			.setCustomId('trade|' + response.data.idTrade)
			.setStyle(ButtonStyle.Primary)
			.setLabel('Accepter');

		row.addComponents(button);

		const embed1 = new EmbedBuilder()
			.setURL('https://google.com')
			.setImage(response.data.imgPokemonPropose)
			.setColor('#D3D3D3')
			.setDescription(
				`**${upFirstLetter(interaction.user.username)} propose d'échanger ${quantityPokemonPropose} ${
					upFirstLetter(pokemonPropose) + hasStar(pokemonProposeShiny)
				} contre ${quantityPokemonRequest} ${upFirstLetter(
					pokemonRequest + hasStar(pokemonRequestShiny)
				)}**`
			);
		const embed2 = new EmbedBuilder()
			.setURL('https://google.com')
			.setImage(
				`https://uxwing.com/wp-content/themes/uxwing/download/arrow-direction/curved-arrow-right-to-bottom-outline-icon.png`
			);
		const embed3 = new EmbedBuilder()
			.setURL('https://google.com')
			.setImage(
				`https://uxwing.com/wp-content/themes/uxwing/download/arrow-direction/curved-arrow-left-to-top-outline-icon.png`
			);
		const embed4 = new EmbedBuilder()
			.setURL('https://google.com')
			.setImage(response.data.imgPokemonRequest);

		return {
			embeds: [embed1, embed2, embed3, embed4],
			components: [row],
		};
	} catch (error) {
		console.error(error);
	}
}

async function acceptSwapPokemon(idTrade, interaction) {
	const idTrainer = interaction.user.id;
	try {
		const response = await API.post(`/trainer/pokemon/trade`, {
			idTrade: idTrade,
			idTrainer: idTrainer,
			type: 'accept',
		});

		const status = response.data.status;
		if (status === 'success') {
			await handleTradeButtonInteraction(idTrade, interaction);
			return null;
		} else {
			if (status === 'not enough pokemon propose') {
				return `Le dresseur n'a plus assez de ce pokémon.`;
			} else if (status === 'not enough pokemon request') {
				return `Vous n'avez pas assez de ce pokémon.`;
			} else if (status === 'already accepted') {
				return `Cette échange a déjà été éffectué.`;
			}
		}
	} catch (error) {
		console.error(error);
		return "Une erreur est survenue lors de l'échange.";
	}
}

async function handleTradeButtonInteraction(idTrade, interaction) {
	const button = new ButtonBuilder()
		.setCustomId('trade|' + idTrade)
		.setStyle(ButtonStyle.Secondary)
		.setLabel('Échange terminé')
		.setDisabled(true);

	await interaction.update({
		components: [new ActionRowBuilder().addComponents(button)],
	});
}

async function buyRune(interaction) {
	const pokemonName = interaction.options.getString('nom').toLowerCase();
	if (pokemonName === 'mew') {
		return 'Vous ne pouvez pas acheter de rune pour Mew.';
	}

	const quantity = interaction.options.getInteger('quantité') ?? 1;
	if (quantity <= 0) {
		return 'Vous devez indiquer une quantité supérieure à 0.';
	}

	const idTrainer = interaction.user.id;
	try {
		const response = await API.post(`/rune/buy`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
			quantity: quantity,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} n'est pas un pokémon.`;
		} else if (response.data.status === 'noSell') {
			return `Seul les pokémons disponibles à l'état sauvage peuvent être achetés.`;
		} else if (response.data.status === 'noMoney') {
			return `Vous n'avez pas assez d'argent.`;
		} else if (response.data.status === 'buy') {
			return `Vous avez acheté ${quantity} rune de ${upFirstLetter(
				pokemonName
			)} pour ${formatNombreAvecSeparateur(response.data.priceSend)} pokédollars.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function checkRune(interaction) {
	try {
		const response = await API.get(`/rune/` + interaction.user.id);
		if (response.data.rune.length === 0) {
			return "Vous n'avez pas de rune de pokémon.";
		}
		const sumRune = response.data.sumRune;
		const countRune = response.data.countRune;
		const items = response.data.rune.map((rune) => `- ${rune.quantity} ${rune.name}`);
		const title = `Vous avez ${sumRune} rune${sumRune > 1 ? 's' : ''} de pokémon${
			countRune > 1 ? `, dont ${response.data.countRune} différents.` : '.'
		}`;
		const footer = `Liste des runes de pokémon de ${interaction.user.globalName}`;
		const thumbnailUrl = interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

		let embed = createListEmbed(items, title, footer, thumbnailUrl, null, '#9f53ec');

		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function kickMember(message) {
	const member = message.mentions.members.first();
	if (member) {
		API.delete(`/trainer/` + member.user.id);
		member.kick();
	}
}

export {
	addTrainer,
	getBallTrainer,
	getPokedex,
	getMoney,
	buyBall,
	getBadge,
	getPrice,
	sellPokemon,
	handleCatch,
	purposeSwapPokemon,
	acceptSwapPokemon,
	handleTradeButtonInteraction,
	buyRune,
	checkRune,
	pricePokemon,
	kickMember,
};
