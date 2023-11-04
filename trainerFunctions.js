import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';
import { capitalizeFirstLetter, formatNombreAvecSeparateur } from './globalFunctions.js';
import { balls } from './variables.js';
import { createButtons } from './globalFunctions.js';

async function addTrainer(member) {
	try {
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/trainer/verify/` + member.id
		);
		if (!response.data.hasAccount) {
			await axios.post(`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/trainer`, {
				trainer: {
					idDiscord: member.id,
					name: member.user.username,
					money: 1000,
					point: 0,
					level: 0,
				},
				ball: [
					{
						id: 1,
						quantity: 10,
					},
					{
						id: 2,
						quantity: 5,
					},
					{
						id: 3,
						quantity: 1,
					},
				],
			});
		}
	} catch (error) {
		console.error(error);
	}
}

async function catchPokemon(catchCode, idTrainer, idPokeball) {
	try {
		const catchPokemon = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/catch`,
			{
				catchCode: catchCode,
				idTrainer: idTrainer,
				idBall: idPokeball,
			}
		);
		return catchPokemon.data;
	} catch (error) {
		console.error(error);
	}
}

async function sellPokemon(idTrainer, namePokemon, quantity) {
	try {
		if (quantity <= 0) {
			return "Vous ne pouvez pas vendre moins d'un pokémon.";
		}
		const sellPokemon = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/sell`,
			{
				namePokemon: namePokemon,
				idTrainer: idTrainer,
				quantity: quantity,
			}
		);
		if (sellPokemon.data.status === 'noPokemon') {
			return "Vous n'avez pas " + quantity + ' ' + namePokemon + '.';
		} else if (sellPokemon.data.status === 'sell') {
			return (
				'Vous avez vendu ' +
				quantity +
				' ' +
				namePokemon +
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

async function getBallTrainer(message) {
	try {
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokeball/trainer/` + message.member.id
		);
		let strResponse = 'Vous avez : \n';
		for (let i = 0; i < response.data.length; i++) {
			const customEmoji = message.guild.emojis.cache.find(
				(emoji) => emoji.name === response.data[i].name
			);
			strResponse +=
				'- ' + (customEmoji ? customEmoji.toString() : '') + ' : ' + response.data[i].quantity + '\n';
		}
		return strResponse;
	} catch (error) {
		console.error(error);
	}
}

async function getPokedex(idTrainer, otherTrainer = false) {
	try {
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/trainer/` + idTrainer
		);
		if (response.data.pokemon.length === 0) {
			return "Vous n'avez pas encore de pokémon.";
		}
		let strResponse = `${otherTrainer ? 'Ce dresseur a' : 'Vous avez'} ${
			response.data.sumPokemon
		} pokémon, dont ${response.data.countPokemon} différents.\n${
			otherTrainer ? 'Son' : 'Votre'
		} pokedex : \n`;
		for (let i = 0; i < response.data.pokemon.length; i++) {
			strResponse += `- ${response.data.pokemon[i].quantity} ${response.data.pokemon[i].name}\n`;
		}
		return strResponse;
	} catch (error) {
		console.error(error);
	}
}

async function getMoney(idTrainer) {
	try {
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/trainer/` + idTrainer
		);
		return 'Vous avez : ' + formatNombreAvecSeparateur(response.data.money) + ' pokédollars.';
	} catch (error) {
		console.error(error);
	}
}

async function priceBall(idBall) {
	try {
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokeball/` + idBall
		);
		return `Le prix d'une ${capitalizeFirstLetter(
			response.data.name
		)} est de ${formatNombreAvecSeparateur(response.data.buyingPrice)} pokédollars.`;
	} catch (error) {
		console.error("La pokéball n'existe pas.");
	}
}

async function pricePokemon(namePokemon) {
	try {
		const response = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/info`,
			{
				namePokemon: namePokemon,
			}
		);
		let pokemon = response.data;
		if (pokemon.status === 'noExistPokemon') {
			return `${capitalizeFirstLetter(namePokemon)} n'est ni un pokémon, ni une pokeball.`;
		} else {
			return `Le prix de vente d'un ${capitalizeFirstLetter(
				namePokemon
			)} est de ${formatNombreAvecSeparateur(pokemon.infos.sellPrice)} pokédollars.`;
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
		const response = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokeball/buy`,
			{
				idDiscord: idTrainer,
				idBall: idBall,
				quantity: quantity,
			}
		);
		if (response.data.status === 'noMoney') {
			return "Vous n'avez pas assez d'argent.";
		} else if (response.data.status === 'buy') {
			return (
				'Vous avez acheté ' +
				quantity +
				' ' +
				capitalizeFirstLetter(nameBall) +
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
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/trainer/` + idTrainer
		);
		if (response.data.sumPokemon < nbPokemon) {
			return `Vous n'avez pas assez de pokémon pour obtenir le badge ${nameBadge}.`;
		}
		if (response.data.countPokemon < nbPokemonDiff) {
			return `Vous n'avez pas assez de pokémon différents pour obtenir le badge ${nameBadge}.`;
		}
	} catch (error) {
		console.error(error);
	}
	let badgeRole = message.guild.roles.cache.find((role) => role.name === roleBadge);

	if (badgeRole) {
		if (message.member.roles.cache.has(badgeRole.id)) {
			return `Vous avez déjà le badge ${nameBadge}.`;
		}
		message.member.roles.add(badgeRole).catch(console.error);
		return `Vous avez reçu le badge ${nameBadge} !`;
	}
}

async function handleCatch(interaction, idPokeball) {
	const catchCode = interaction.customId.split('|')[1];
	const idTrainer = interaction.user.id;
	const response = await catchPokemon(catchCode, idTrainer, idPokeball);
	let replyMessage;
	let components;

	switch (response.status) {
		case 'noCatch':
			replyMessage = `Le ${response.pokemonName} est resorti, retentez votre chance !`;
			components = [createButtons(interaction.message, catchCode)];
			break;
		case 'catch':
			replyMessage = `Le ${response.pokemonName} a été capturé par <@${interaction.user.id}>.`;
			break;
		case 'escape':
			replyMessage = `Le ${response.pokemonName} s'est échappé !`;
			break;
		case 'alreadyCatch':
			replyMessage = `Le Pokémon a déjà été capturé.`;
			break;
		case 'alreadyEscape':
			replyMessage = `Le Pokémon s'est déjà échappé.`;
			break;
		case 'noBall':
			replyMessage = `Vous n'avez pas de ${balls.find((ball) => ball.id === idPokeball).name}.`;
			break;
		case 'noExistPokemon':
			replyMessage = `Le pokémon a disparu.`;
			break;
		default:
			replyMessage = 'Une erreur inattendue s’est produite.';
	}

	interaction.reply({ content: replyMessage, components });
}

async function purposeSwapPokemon(interaction) {
	const pokemonPropose = interaction.options.getString('nom_pokemon_propose');
	const pokemonRequest = interaction.options.getString('nom_pokemon_demande');
	const quantityPokemonPropose = interaction.options.getInteger('quantité_pokemon_propose');
	const quantityPokemonRequest = interaction.options.getInteger('quantité_pokemon_demande');
	if (quantityPokemonPropose <= 0 || quantityPokemonRequest <= 0) {
		return 'Vous devez proposer/demander au moins un pokémon.';
	}
	try {
		const response = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/trainer/pokemon/trade`,
			{
				idTrainer: interaction.user.id,
				pokemonPropose: pokemonPropose,
				pokemonRequest: pokemonRequest,
				quantityPokemonPropose: quantityPokemonPropose,
				quantityPokemonRequest: quantityPokemonRequest,
				type: 'propose',
			}
		);
		if (response.data.status === 'not enough pokemon propose') {
			return `Vous n'avez pas assez de ${capitalizeFirstLetter(pokemonPropose)}.`;
		} else if (response.data.status === 'not found pokemon propose') {
			return `${capitalizeFirstLetter(pokemonPropose)} n'est pas un pokémon.`;
		} else if (response.data.status === 'not found pokemon request') {
			return `${capitalizeFirstLetter(pokemonRequest)} n'est pas un pokémon.`;
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
			.setDescription(
				`**${capitalizeFirstLetter(
					interaction.user.username
				)} propose d'échanger ${interaction.options.getInteger(
					'quantité_pokemon_propose'
				)} ${capitalizeFirstLetter(
					interaction.options.getString('nom_pokemon_propose')
				)} contre ${interaction.options.getInteger('quantité_pokemon_demande')} ${capitalizeFirstLetter(
					interaction.options.getString('nom_pokemon_demande')
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
		const response = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/trainer/pokemon/trade`,
			{
				idTrade: idTrade,
				idTrainer: idTrainer,
				type: 'accept',
			}
		);
		const status = response.data.status;
		if (status === 'not enough pokemon propose') {
			return `Le dresseur n'a plus assez de ce pokémon.`;
		} else if (status === 'not enough pokemon request') {
			return `Vous n'avez pas assez de ce pokémon.`;
		} else if (status === 'already accepted') {
			return `Cette échange a déjà été éffectué.`;
		} else if (status === 'success') {
			await handleTradeButtonInteraction(idTrade, interaction);
			return `L'échange a été éffectué avec succès.`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function handleTradeButtonInteraction(idTrade, interaction) {
	// Désactivez le bouton et changez le texte
	const button = new ButtonBuilder()
		.setCustomId('trade|' + idTrade)
		.setStyle(ButtonStyle.Secondary)
		.setLabel('Échange terminé')
		.setDisabled(true);

	// Mettez à jour le message original avec le nouveau bouton
	await interaction.update({
		components: [new ActionRowBuilder().addComponents(button)],
	});
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
};
