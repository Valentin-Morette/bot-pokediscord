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
			return 'Vous devez vendre au moins un Pokemon.';
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
				formatNombreAvecSeparateur(sellPokemon.data.sellPrice) +
				' Pokedollars.'
			);
		} else if (sellPokemon.data.status === 'noExistPokemon') {
			return namePokemon + " n'est pas un Pokémon.";
		}
	} catch (error) {
		console.error('Erreur lors de la vente du Pokemon.');
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
		const footer = 'Liste des Pokéball de ' + interaction.member.user.username;
		const thumbnailUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
		const embed = createListEmbed(arrResponse, 'Vos Pokéballs:', footer, thumbnailUrl, null, '#E31030');
		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function getPokedexList(interaction, type) {
	const generationList = [1, 2];
	const numberPokemonByGeneration = {
		1: { name: 'Kanto', number: 151 },
		2: { name: 'Johto', number: 100 },
	};
	let user = interaction.options.getUser('dresseur') ?? interaction.user;
	let pokedexList = [];
	for (let i = 0; i < generationList.length; i++) {
		let response = await API.get(`/pokemon/trainer/` + user.id + '/' + generationList[i] + '/' + type);
		pokedexList.push(
			'- ' +
				numberPokemonByGeneration[generationList[i]].name +
				' : ' +
				response.data.countPokemon +
				'/' +
				numberPokemonByGeneration[generationList[i]].number
		);
	}

	const title = `Votre liste de ${type === 'shiny' ? 'Shiny' : 'Poke'}dex.`;
	const footer = `Pokedex de ${user.globalName}`;
	const thumbnailUrl = user.displayAvatarURL({ format: 'png', dynamic: true });

	let embed = createListEmbed(
		pokedexList,
		title,
		footer,
		thumbnailUrl,
		null,
		type === 'shiny' ? '#FFED00' : '#FF0000'
	);

	return { embeds: [embed] };
}

async function dailyGift(interaction) {
	const idTrainer = interaction.user.id;
	try {
		const response = await API.get(`/trainer/gift/` + idTrainer);
		console.log(response.data);
		if (response.data.status === 'successMoney') {
			return `Vous avez reçu ${response.data.amount} pokédollars.`;
		} else if (response.data.status === 'successBall') {
			const emojiBall = interaction.guild.emojis.cache.find(
				(emoji) => emoji.name === response.data.pokeball.name
			);
			return `Vous avez reçu ${response.data.quantity}${emojiBall}.`;
		} else if (response.data.status === 'successPokemon') {
			return `Vous avez reçu un ${response.data.pokemon.name} ${hasStar(response.data.isShiny)}.`;
		} else if (response.data.status === 'alreadyGift') {
			return `Vous avez déjà reçu un cadeau il y a moins de 12H.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function getPokedex(interaction, type) {
	// UPDATEGENERATION: Update the number of pokemons by generation
	const numberPokemonByGeneration = {
		1: 151,
		2: 100,
	};

	let generation = interaction.options.getInteger('generation');
	if (generation == null) {
		// UPDATEGENERATION: Update the category name for each generation
		const categoryNameForGeneration = {
			'𝐊𝐀𝐍𝐓𝐎': 1,
			'𝐉𝐎𝐇𝐓𝐎': 2,
		};
		generation = categoryNameForGeneration[interaction.channel.parent.name] ?? 1;
	}

	let user = interaction.options.getUser('dresseur') ?? interaction.user;
	let sameUser = user.id !== interaction.user.id;
	try {
		const response = await API.get(`/pokemon/trainer/` + user.id + '/' + generation + '/' + type);
		const pokemons = response.data.pokemon;
		if (pokemons.length === 0) {
			return (
				`${sameUser ? `${user.globalName} n'a` : `Vous n'avez`} pas encore de Pokémon` +
				(type === 'shiny' ? ' shiny' : '') +
				'.'
			);
		}

		const items = pokemons.map((pokemon) => `- ${pokemon.quantity} ${pokemon.name}`);
		const title = `${sameUser ? `${user.globalName} a` : 'Vous avez'} ${
			response.data.sumPokemon
		} Pokémon${hasStar(type === 'shiny')}, dont ${response.data.countPokemon} différents.`;

		const footer =
			(type === 'shiny' ? 'Shiny' : 'Poke') +
			'dex de ' +
			user.globalName +
			' - ' +
			response.data.countPokemon +
			'/' +
			numberPokemonByGeneration[generation];

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

async function getAffiliateCode(idTrainer) {
	try {
		const response = await API.get(`/trainer/` + idTrainer);
		return 'Votre code affilié est : ' + response.data.affiliateCode;
	} catch (error) {
		console.error(error);
	}
}

async function useAffiliateCode(idTrainer, affiliateCode) {
	try {
		const response = await API.post(`/trainer/affiliate`, {
			idTrainer: idTrainer,
			affiliateCode: affiliateCode,
		});
		if (response.data.status === 'noExistCode') {
			return "Ce code d'affiliation n'existe pas.";
		} else if (response.data.status === 'alreadyAffiliate') {
			return "Vous avez déjà utilisé un code d'affiliation.";
		} else if (response.data.status === 'sameTrainer') {
			return "Vous ne pouvez pas utiliser votre propre code d'affiliation.";
		} else if (response.data.status === 'success') {
			return (
				"Vous avez reçu 10 000 pokédollars en utilisant le code d'affiliation de " +
				upFirstLetter(response.data.name)
			);
		}
	} catch (error) {
		console.error(error);
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
			)} n'est pas un Pokémon achetable, car il n'est pas disponible à l'état sauvage.`;
		}
		const sellPrice = isRune ? pokemon.infos.sellPrice * 3 : pokemon.infos.sellPrice;
		if (pokemon.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} + "n'est pas un Pokémon.`;
		} else {
			return `Le prix de vente d'${isRune ? 'une rune de' : 'un'} ${upFirstLetter(
				namePokemon
			)} est de ${formatNombreAvecSeparateur(sellPrice)} Pokedollars. ${isRune ? '' : '(x3 si shiny)'}`;
		}
	} catch (error) {
		console.error("Ce Pokemon n'existe pas.");
	}
}

async function getPrice(item) {
	return await pricePokemon(item);
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
				`Vous n'avez pas assez d'argent, vous avez ${formatNombreAvecSeparateur(
					response.data.money
				)}$ et il vous faut ${formatNombreAvecSeparateur(response.data.price)}$. \n` +
				`Pour obtenir plus d'argent, vendez des Pokémon en utilisant les commandes **\`/sell\`** ou **\`/sell-shiny\`**`
			);
		} else if (response.data.status === 'buy') {
			return `Vous avez acheté ${quantity} ${upFirstLetter(nameBall)} pour ${formatNombreAvecSeparateur(
				response.data.price
			)} Pokédollars.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function getBadge(message, nbPokemon, nbPokemonDiff, nameBadge, roleBadge, generation) {
	let idTrainer = message.member.id;
	let pokemonType =
		nameBadge === 'Maître Pokémon Shiny' || nameBadge === 'Maître Pokémon Shiny Gen 2'
			? 'shiny'
			: 'regular';
	try {
		const response = await API.get(
			`/pokemon/trainer/` + idTrainer + '/' + generation + '/' + pokemonType
		);
		if (response.data.sumPokemon < nbPokemon) {
			return `Vous n'avez pas assez de Pokémon pour obtenir le badge ${nameBadge}.`;
		}
		if (response.data.countPokemon < nbPokemonDiff) {
			return `Vous n'avez pas assez de Pokémon différents pour obtenir le badge ${nameBadge}.`;
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
			replyMessage = `Le ${response.pokemonName} s'est échappé, réessayez !`;
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
			replyMessage = `Le ${response.pokemonName} a été attrapé par <@${interaction.user.id}>.`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			components = await disabledButtons(interaction);
			break;
		case 'escape':
			newEmbed.setColor('#c71a28');
			if (secondOriginalEmbed !== null) {
				newEmbed2.setColor('#c71a28');
			}
			replyMessage = `Le ${response.pokemonName} s'est échappé! dommage`;
			addFieldsValue = parseInt(addFieldsValue) + 1;
			components = await disabledButtons(interaction);
			break;
		case 'alreadyCatch':
			newEmbed.setColor(originalEmbed.color);
			replyMessage = `Le Pokémon a déjà été attrapé.`;
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
			replyMessage = `Le Pokémon a disparu.`;
			components = await disabledButtons(interaction);
			break;
		default:
			replyMessage = 'An unexpected error occurred.';
	}

	newEmbed.setDescription(replyMessage);
	newEmbed.addFields({ name: 'Tentatives', value: addFieldsValue.toString(), inline: true });

	const responseEmbed = { embeds: [newEmbed], components };

	if (secondOriginalEmbed !== null) {
		responseEmbed.embeds.push(newEmbed2);
	}

	// Assurez-vous d'attendre l'update avant d'aller plus loin
	await interaction.update(responseEmbed);

	if (response.status !== 'noCatch' && response.status !== 'noBall') {
		await findRandomPokemon(interaction, type, true);
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

		// Utilisation de setTimeout pour envoyer un message au bon moment, mais assurez-vous que l'interaction est déjà mise à jour avant cela
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

	const title = needReply
		? 'Bienvenue à la boutique de Pokéballs !'
		: "Vous n'avez pas de Pokéballs ? Pas de problème !";

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
	const title = '🎉 Premier Pokémon Capturé ! 🎉';
	const footer = 'Tutoriel - 2/2';
	const description =
		`Vous pouvez voir vos Pokémon capturés en tapant **\`/pokedex\`** dans n'importe quel canal.\n\n` +
		`Vous avez utilisé quelques Pokéballs, rendez-vous dans le canal 🛒・𝐁𝐨𝐮𝐭𝐢𝐪𝐮𝐞 pour en acheter davantage.\n\n` +
		`Pour voir la liste de vos Pokéballs, tapez **\`/ball\`**.\n` +
		`Pour vérifier votre argent, tapez **\`/argent\`**.\n\n` +
		`Pour voir la liste des commandes, rendez-vous dans le canal 🧾・𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬.`;

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
	const quantityPokemonPropose = interaction.options.getInteger('quantite_pokemon_propose');
	const quantityPokemonRequest = interaction.options.getInteger('quantite_pokemon_demande');
	const pokemonProposeShiny = interaction.options.getString('pokemon_propose_shiny') === 'true';
	const pokemonRequestShiny = interaction.options.getString('pokemon_demande_shiny') === 'true';
	if (quantityPokemonPropose <= 0 || quantityPokemonRequest <= 0) {
		return 'Vous devez proposer et demander au moins un Pokémon.';
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
			return `${upFirstLetter(pokemonPropose)} n'est pas un Pokémon.`;
		} else if (response.data.status === 'not found pokemon request') {
			return `${upFirstLetter(pokemonRequest)} n'est pas un Pokémon.`;
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
				`**${upFirstLetter(interaction.user.username)} veux échanger ${quantityPokemonPropose} ${
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
				return `Le dresseur n'a plus assez de ce Pokémon.`;
			} else if (status === 'not enough pokemon request') {
				return `Vous n'avez pas assez de ce Pokémon.`;
			} else if (status === 'already accepted') {
				return `Cet échange a déjà été effectué.`;
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
	const pokemonName = interaction.options.getString('nom').toLowerCase();
	if (pokemonName === 'mew') {
		return 'Vous ne pouvez pas acheter de rune pour Mew.';
	}

	const quantity = interaction.options.getInteger('quantite') ?? 1;
	if (quantity <= 0) {
		return 'Vous devez acheter au moins une rune.';
	}

	const idTrainer = interaction.user.id;
	try {
		const response = await API.post(`/rune/buy`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
			quantity: quantity,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} n'est pas un Pokémon.`;
		} else if (response.data.status === 'noSell') {
			return `Seuls les Pokémon disponibles dans la nature peuvent être achetés.`;
		} else if (response.data.status === 'noMoney') {
			return `Vous n'avez pas assez d'argent.`;
		} else if (response.data.status === 'buy') {
			return `Vous avez acheté ${quantity} rune de ${upFirstLetter(
				pokemonName
			)} pour ${formatNombreAvecSeparateur(response.data.priceSend)} Pokedollars.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function quantityPokemon(interaction, isShiny = false) {
	const pokemonName = interaction.options.getString('nom').toLowerCase();
	const idTrainer = interaction.user.id;
	try {
		const response = await API.post(`/pokemon/quantity`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
			isShiny: isShiny,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} n'est pas un Pokémon.`;
		} else {
			return `Vous avez ${response.data.quantity} ${upFirstLetter(pokemonName)}${hasStar(
				isShiny
			)} dans votre ${isShiny ? 'shiny' : 'poke'}dex.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function checkRune(interaction) {
	try {
		const response = await API.get(`/rune/` + interaction.user.id);
		if (response.data.rune.length === 0) {
			return "Vous n'avez pas de rune de Pokémon.";
		}
		const sumRune = response.data.sumRune;
		const countRune = response.data.countRune;
		const items = response.data.rune.map((rune) => `- ${rune.quantity} ${rune.name}`);
		const title = `Vous avez ${sumRune} rune${sumRune > 1 ? 's' : ''} de Pokémon${
			countRune > 1 ? `, dont ${response.data.countRune} différentes.` : '.'
		}`;
		const footer = `Liste des runes de Pokémon de ${interaction.user.globalName}`;
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
	dailyGift,
	getBallTrainer,
	getPokedex,
	getPokedexList,
	getMoney,
	getAffiliateCode,
	useAffiliateCode,
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
