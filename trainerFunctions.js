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

const shopCooldowns = new Map();

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
			return 'You cannot sell less than one Pokemon.';
		}
		const sellPokemon = await API.post(`/pokemon/sell`, {
			namePokemon: namePokemon,
			idTrainer: idTrainer,
			quantity: quantity,
			isShiny: isShiny,
			max: max,
		});
		if (sellPokemon.data.status === 'noPokemon') {
			return "You don't have " + sellPokemon.data.quantity + ' ' + namePokemon + '.';
		} else if (sellPokemon.data.status === 'sell') {
			return (
				'You sold ' +
				sellPokemon.data.quantity +
				' ' +
				namePokemon +
				hasStar(isShiny) +
				' for ' +
				formatNombreAvecSeparateur(sellPokemon.data.sellPrice) +
				' Pokedollars.'
			);
		} else if (sellPokemon.data.status === 'noExistPokemon') {
			return namePokemon + ' is not a Pokemon.';
		}
	} catch (error) {
		console.error('Error selling a Pokemon.');
	}
}

async function getBallTrainer(interaction) {
	let user = interaction.user;
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
		const footer = 'List of Pokeballs for ' + interaction.member.user.username;
		const thumbnailUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
		const embed = createListEmbed(arrResponse, 'Your Pokeballs:', footer, thumbnailUrl, null, '#E31030');
		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function getPokedex(interaction, type) {
	let user = interaction.options.getUser('trainer') ?? interaction.user;
	console.log(user);
	let sameUser = user.id !== interaction.user.id;
	try {
		const response = await API.get(`/pokemon/trainer/` + user.id + '/' + type);
		const pokemons = response.data.pokemon;
		if (pokemons.length === 0) {
			return (
				`${sameUser ? `${user.globalName} has` : `You have`} no Pokemon` +
				(type === 'shiny' ? ' shiny' : '') +
				' yet.'
			);
		}

		const items = pokemons.map((pokemon) => `- ${pokemon.quantity} ${pokemon.name}`);
		const title = `${sameUser ? `${user.globalName} has` : 'You have'} ${
			response.data.sumPokemon
		} Pokemon${hasStar(type === 'shiny')}, including ${response.data.countPokemon} different ones.`;

		const footer =
			(type === 'shiny' ? 'Shiny' : 'Poke') +
			'dex of ' +
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
		return 'You have: ' + formatNombreAvecSeparateur(response.data.money) + ' pokedollars.';
	} catch (error) {
		console.error(error);
	}
}

async function priceBall(idBall) {
	try {
		const response = await API.get(`/pokeball/` + idBall);
		return `The price of a ${upFirstLetter(response.data.name)} is ${formatNombreAvecSeparateur(
			response.data.buyingPrice
		)} Pokedollars.`;
	} catch (error) {
		console.error('The Pokeball does not exist.');
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
			)} is not a purchasable Pokemon, as it is not available in the wild.`;
		}
		const sellPrice = isRune ? pokemon.infos.sellPrice * 3 : pokemon.infos.sellPrice;
		if (pokemon.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} is ${
				isRune ? 'not a Pokemon' : 'neither a Pokemon nor a Pokeball'
			}.`;
		} else {
			return `The selling price of ${isRune ? 'a rune of' : 'a'} ${upFirstLetter(
				namePokemon
			)} is ${formatNombreAvecSeparateur(sellPrice)} Pokedollars. ${isRune ? '' : '(x3 if shiny)'}`;
		}
	} catch (error) {
		console.error('The Pokemon does not exist.');
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
			return (
				`You don't have enough money, you have ${formatNombreAvecSeparateur(
					response.data.money
				)}$ and you need ${formatNombreAvecSeparateur(response.data.price)}$. \n` +
				`To get more money, sell Pokemon using the commands **\`/sell\`** or **\`/sell-shiny\`**`
			);
		} else if (response.data.status === 'buy') {
			return `You bought ${quantity} ${upFirstLetter(nameBall)} for ${formatNombreAvecSeparateur(
				response.data.price
			)}$.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function getBadge(message, nbPokemon, nbPokemonDiff, nameBadge, roleBadge) {
	let idTrainer = message.member.id;
	let pokemonType = nameBadge === 'Shiny Pokemon Master' ? 'shiny' : 'regular';
	try {
		const response = await API.get(`/pokemon/trainer/` + idTrainer + '/' + pokemonType);
		if (response.data.sumPokemon < nbPokemon) {
			return `You don't have enough Pokemon to earn the ${nameBadge} badge.`;
		}
		if (response.data.countPokemon < nbPokemonDiff) {
			return `You don't have enough different Pokemon to earn the ${nameBadge} badge.`;
		}
		let badgeRole = message.guild.roles.cache.find((role) => role.name === roleBadge);

		if (badgeRole) {
			if (message.member.roles.cache.has(badgeRole.id)) {
				return `You already have the ${nameBadge} badge.`;
			}
			message.member.roles.add(badgeRole).catch(console.error);
			return `You have received the ${nameBadge} badge!`;
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
	let secondOriginalEmbed = null;
	const newEmbed = new EmbedBuilder()
		.setTitle(originalEmbed.title)
		.setThumbnail(originalEmbed.thumbnail?.url);
	const newEmbed2 = new EmbedBuilder();
	if (interaction.message.embeds.length > 1) {
		secondOriginalEmbed = interaction.message.embeds[1];
		newEmbed2
			.setTitle(secondOriginalEmbed.title)
			.setThumbnail(secondOriginalEmbed.thumbnail?.url)
			.setDescription(secondOriginalEmbed.description)
			.setColor(secondOriginalEmbed.color)
			.addFields(secondOriginalEmbed.fields);
	}

	let addFieldsValue = originalEmbed.fields[0]?.value ?? '0';

	switch (response.status) {
		case 'noCatch':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `The ${response.pokemonName} broke free, try again!`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			break;
		case 'catch':
			if (response.sendTuto) {
				sendSecondaryTutorialMessage(interaction);
			}
			newEmbed.setColor('#3aa12f');
			if (secondOriginalEmbed !== null) {
				newEmbed2.setColor('#3aa12f');
			}
			replyMessage = `The ${response.pokemonName} was caught by <@${interaction.user.id}>.`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			components = await disabledButtons(interaction);
			break;
		case 'escape':
			newEmbed.setColor('#c71a28');
			if (secondOriginalEmbed !== null) {
				newEmbed2.setColor('#c71a28');
			}
			replyMessage = `The ${response.pokemonName} escaped!`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			components = await disabledButtons(interaction);
			break;
		case 'alreadyCatch':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `The Pokemon has already been caught.`;
			break;
		case 'alreadyEscape':
			replyMessage = `The Pokemon has already escaped.`;
			break;
		case 'noBall':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `You don't have a ${balls.find((ball) => ball.id === idPokeball).name}.`;
			break;
		case 'noExistPokemon':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `The Pokemon has disappeared.`;
			components = await disabledButtons(interaction);
			break;
		default:
			replyMessage = 'An unexpected error occurred.';
	}

	newEmbed.setDescription(replyMessage);
	newEmbed.addFields({ name: 'Attempts', value: addFieldsValue.toString(), inline: true });

	const responseEmbed = { embeds: [newEmbed], components };

	if (secondOriginalEmbed !== null) {
		responseEmbed.embeds.push(newEmbed2);
	}

	interaction.update(responseEmbed);

	if (response.status !== 'noCatch' && response.status !== 'noBall') {
		setTimeout(() => findRandomPokemon(interaction, type, true), 700);
	} else if (response.status === 'noBall') {
		const now = Date.now();
		const cooldownAmount = 10000;

		if (shopCooldowns.has(interaction.user.id)) {
			const expirationTime = shopCooldowns.get(interaction.user.id);
			if (now < expirationTime) {
				return;
			}
		}

		shopCooldowns.set(interaction.user.id, now + cooldownAmount);

		for (const [key, val] of shopCooldowns) {
			if (now > val) {
				shopCooldowns.delete(key);
			}
		}
		setTimeout(() => shopMessage(interaction), 500);
	}
}

async function shopMessage(interaction, needReply = false) {
	const channel = interaction.channel;

	const attachment = new AttachmentBuilder(`./assets/shop.png`);

	const pokeballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'pokeball');
	const superballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'superball');
	const hyperballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'hyperball');
	const masterballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'masterball');

	const title = needReply ? 'Welcome to the Pokeball shop!' : "Don't have any Pokeballs? No problem!";

	const priceEmbed = new EmbedBuilder()
		.setColor('#FFFFFF')
		.setTitle(title)
		.setDescription(
			`${pokeballEmoji} Pokeball : 50 $\n\n` +
				`${superballEmoji} Superball : 80 $\n\n` +
				`${hyperballEmoji} Hyperball : 150 $\n\n` +
				`${masterballEmoji} Masterball : 100 000 $\n\n`
		)
		.setThumbnail(`attachment://shop.png`);

	let rows = [];
	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];

	for (let i = 10; i <= 100; i *= 10) {
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			let number = ball === 'masterball' ? i / 10 : i;
			const button = new ButtonBuilder()
				.setCustomId('buy|' + number + '|' + ball)
				.setStyle(ButtonStyle.Secondary)
				.setLabel('' + number)
				.setEmoji(customEmoji.id);

			row.addComponents(button);
		});
		rows.push(row);
	}

	if (needReply) {
		return { embeds: [priceEmbed], files: [attachment], components: rows };
	} else {
		await channel.send({ embeds: [priceEmbed], files: [attachment], components: rows });
	}
}

async function sendSecondaryTutorialMessage(interaction) {
	const shopChannel = interaction.guild.channels.cache.find((channel) => channel.name === '🛒・𝐒𝐡𝐨𝐩');
	const commandChannel = interaction.guild.channels.cache.find(
		(channel) => channel.name === '🧾・𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬'
	);
	const title = '🎉 First Pokemon Caught! 🎉';
	const footer = 'Tutorial - 2/2';
	const description =
		`You can view your captured Pokemon by typing **\`/pokedex\`** in any channel.\n\n` +
		`You used some Pokeballs, head over to the <#${shopChannel.id}> channel to buy more.\n\n` +
		`To see the list of your Pokeballs, type **\`/ball\`**.\n` +
		`To check your money, type **\`/money\`**.\n\n` +
		`To see the list of commands, go to the <#${commandChannel.id}> channel.`;

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
	const pokemonPropose = interaction.options.getString('name_pokemon_offer');
	const pokemonRequest = interaction.options.getString('name_pokemon_request');
	const quantityPokemonPropose = interaction.options.getInteger('quantity_pokemon_offer');
	const quantityPokemonRequest = interaction.options.getInteger('quantity_pokemon_request');
	const pokemonProposeShiny = interaction.options.getString('pokemon_offer_shiny') === 'true';
	const pokemonRequestShiny = interaction.options.getString('pokemon_request_shiny') === 'true';
	if (quantityPokemonPropose <= 0 || quantityPokemonRequest <= 0) {
		return 'You must offer/request at least one Pokemon.';
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
			return `You don't have enough ${upFirstLetter(pokemonPropose) + hasStar(pokemonProposeShiny)}.`;
		} else if (response.data.status === 'not found pokemon propose') {
			return `${upFirstLetter(pokemonPropose)} is not a Pokemon.`;
		} else if (response.data.status === 'not found pokemon request') {
			return `${upFirstLetter(pokemonRequest)} is not a Pokemon.`;
		}

		let row = new ActionRowBuilder();

		const button = new ButtonBuilder()
			.setCustomId('trade|' + response.data.idTrade)
			.setStyle(ButtonStyle.Primary)
			.setLabel('Accept');

		row.addComponents(button);

		const embed1 = new EmbedBuilder()
			.setURL('https://google.com')
			.setImage(response.data.imgPokemonPropose)
			.setColor('#D3D3D3')
			.setDescription(
				`**${upFirstLetter(interaction.user.username)} offers to trade ${quantityPokemonPropose} ${
					upFirstLetter(pokemonPropose) + hasStar(pokemonProposeShiny)
				} for ${quantityPokemonRequest} ${upFirstLetter(
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
				return `The trainer no longer has enough of this Pokemon.`;
			} else if (status === 'not enough pokemon request') {
				return `You don't have enough of this Pokemon.`;
			} else if (status === 'already accepted') {
				return `This trade has already been completed.`;
			}
		}
	} catch (error) {
		console.error(error);
		return 'An error occurred during the trade.';
	}
}

async function handleTradeButtonInteraction(idTrade, interaction) {
	const button = new ButtonBuilder()
		.setCustomId('trade|' + idTrade)
		.setStyle(ButtonStyle.Secondary)
		.setLabel('Trade completed')
		.setDisabled(true);

	await interaction.update({
		components: [new ActionRowBuilder().addComponents(button)],
	});
}

async function buyRune(interaction) {
	const pokemonName = interaction.options.getString('name').toLowerCase();
	if (pokemonName === 'mew') {
		return 'You cannot buy a rune for Mew.';
	}

	const quantity = interaction.options.getInteger('quantity') ?? 1;
	if (quantity <= 0) {
		return 'You must specify a quantity greater than 0.';
	}

	const idTrainer = interaction.user.id;
	try {
		const response = await API.post(`/rune/buy`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
			quantity: quantity,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} is not a Pokemon.`;
		} else if (response.data.status === 'noSell') {
			return `Only Pokemon available in the wild can be purchased.`;
		} else if (response.data.status === 'noMoney') {
			return `You don't have enough money.`;
		} else if (response.data.status === 'buy') {
			return `You bought ${quantity} rune of ${upFirstLetter(
				pokemonName
			)} for ${formatNombreAvecSeparateur(response.data.priceSend)} Pokedollars.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function quantityPokemon(interaction, isShiny = false) {
	const pokemonName = interaction.options.getString('name').toLowerCase();
	const idTrainer = interaction.user.id;
	try {
		const response = await API.post(`/pokemon/quantity`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
			isShiny: isShiny,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} is not a Pokemon.`;
		} else {
			return `You have ${response.data.quantity} ${upFirstLetter(pokemonName)}${hasStar(
				isShiny
			)} in your ${isShiny ? 'shiny' : 'poke'}dex.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function checkRune(interaction) {
	try {
		const response = await API.get(`/rune/` + interaction.user.id);
		if (response.data.rune.length === 0) {
			return "You don't have any Pokemon runes.";
		}
		const sumRune = response.data.sumRune;
		const countRune = response.data.countRune;
		const items = response.data.rune.map((rune) => `- ${rune.quantity} ${rune.name}`);
		const title = `You have ${sumRune} Pokemon rune${sumRune > 1 ? 's' : ''}${
			countRune > 1 ? `, including ${response.data.countRune} different ones.` : '.'
		}`;
		const footer = `List of Pokemon runes of ${interaction.user.globalName}`;
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
	shopMessage,
	quantityPokemon,
};
