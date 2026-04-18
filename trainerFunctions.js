import {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	AttachmentBuilder,
} from 'discord.js';
import {
	upFirstLetter,
	formatNombreAvecSeparateur,
	createListEmbed,
	API,
	formatRemainingTime,
	isUserAdmin,
	logEvent,
	sendToConsoleChannel
} from './globalFunctions.js';
import { balls } from './variables.js';
import { findRandomPokemon } from './pokemonFunctions.js';
import { premiumEmbed, alsoPremiumEmbed } from './listEmbed.js';
import { buildCommandEmbed } from './createServerFunctions.js';
const shopCooldowns = new Map();

function setBallButtonEmojiOrLabel(button, guild, name) {
	const e = guild.emojis.cache.find(x => x.name === name);
	if (e) button.setEmoji({ id: e.id, name: e.name, animated: e.animated });
	else button.setLabel(name);
}

async function buildFreshBallRow(guild, pokemonId, disabled = false) {
	await guild.emojis.fetch().catch(() => { });
	const balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
	const row = new ActionRowBuilder();
	for (const ball of balls) {
		const btn = new ButtonBuilder()
			.setCustomId(`${ball}|${pokemonId}`)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled);
		setBallButtonEmojiOrLabel(btn, guild, ball);
		row.addComponents(btn);
	}
	return row;
}

async function addTrainer(members, guildId = process.env.IDSERVER) {
	try {
		const defaultMoney = 2500;
		const defaultBalls = [
			{ id: 1, quantity: 50 },
			{ id: 2, quantity: 30 },
			{ id: 3, quantity: 10 },
		];

		const memberArray = Array.isArray(members) ? members : [members];

		if (memberArray.length === 1) {
			const member = memberArray[0];
			if (member.user.bot) {
				return;
			}
			await API.post(`/trainer`, {
				trainer: {
					idDiscord: member.id,
					name: member.user.username,
					money: defaultMoney,
					firstServerId: guildId,
				},
				ball: defaultBalls,
			});
		}
		else {
			const trainers = memberArray
				.filter(m => !m.user.bot)
				.map(m => ({
					idDiscord: m.id,
					name: m.user.username,
					firstServerId: guildId,
				}));

			if (trainers.length > 0) {
				await API.post(`/trainer/bulk`, {
					trainers,
					money: defaultMoney,
					ball: defaultBalls,
				});
			}
		}
	} catch (error) {
		console.error(error);
	}
}


function welcomeTrainer(member) {
	try {
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Bienvenue sur le serveur PokéDiscord !')
			.setDescription(
				`Salut <@${member.id}> !\n\n` +
				`Pour commencer, dirige-toi dans un canal qui représente une zone d'une région pour capturer tes premiers Pokémon. Par la suite, tu pourras visiter le canal \`#📜・commandes\` pour découvrir toutes les commandes disponibles.`
			)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setFooter({ text: 'Amuse-toi bien !' });

		return { embeds: [embed] };
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
			return "Vous n'avez pas " + sellPokemon.data.quantity + ' ' + namePokemon + hasStar(isShiny) + '.';
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
			const fallbackEmojiByBall = { pokeball: '🔴', superball: '🔵', hyperball: '⚫', masterball: '🟣' };
			const customEmoji = interaction.guild.emojis.cache.find(
				(emoji) => emoji.name === response.data[i].name
			);
			const emojiDisplay = customEmoji ? customEmoji.toString() : (fallbackEmojiByBall[response.data[i].name] || '⚪');
			arrResponse.push(`- ${emojiDisplay} : ${response.data[i].quantity}`);
		}
		const footer = 'Liste des Pokéball de ' + interaction.member.user.username;
		const thumbnailUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
		const embed = createListEmbed(arrResponse, 'Vos Pokéballs:', footer, thumbnailUrl, null, '#E31030');
		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function premiumDisplay(discordId) {
	if (await getIsPremium(discordId)) {
		const { embeds, files } = await alsoPremiumEmbed();
		return { embeds, files };
	} else {
		const { embeds, files, components } = await premiumEmbed(true);
		return { embeds, files, components };
	}
}

async function premiumUrl(discordId, serverId) {
	if (await getIsPremium(discordId)) {
		return null;
	}
	try {
		const response = await API.post(`/payment/create-checkout-session`, {
			discordId: discordId,
			priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
			name: 'Premium',
			serverId: serverId,
		});
		return response.data.url;
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function buyBalls(discordId, ballName) {
	const ballPriceId = {
		pokeball: process.env.STRIPE_POKEBALL_PRICE_ID,
		superball: process.env.STRIPE_SUPERBALL_PRICE_ID,
		hyperball: process.env.STRIPE_HYPERBALL_PRICE_ID,
		masterball: process.env.STRIPE_MASTERBALL_PRICE_ID
	}
	try {
		const response = await API.post(`/payment/create-checkout-session`, {
			discordId: discordId,
			priceId: ballPriceId[ballName],
			name: ballName,
		});
		return response.data.url;
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function displayHelp(interaction) {
	let adminIntro = '';
	if (isUserAdmin(interaction.member)) {
		adminIntro =
			'**🔧 Commande d’installation (admin uniquement)**\n' +
			'Utilisez `!install` pour installer automatiquement :\n' +
			'- Une catégorie dédiée avec les forums par génération\n' +
			'- Les threads (posts) pour chaque zone\n' +
			'- Les permissions et émojis nécessaires au bon fonctionnement du bot\n' +
			"⚠️ Cette opération peut prendre **jusqu’à 15 minutes** et le bot fera régulièrement des pauses lors de la création des forums. Assurez-vous également d'avoir 4 emplacements d'émojis libres sur le serveur.\n\n" +
			'**🧩 Outils émojis (admin)**\n' +
			'Utilisez `!addBallEmojis` pour réinstaller uniquement les émojis des Pokéballs (à utiliser uniquement si vous avez des emojis manquants).\n\n' +
			' -------------------------------------------------\n\n';
	}

	const commandEmbed = buildCommandEmbed();
	commandEmbed.setDescription(adminIntro + commandEmbed.data.description);
	return { embeds: [commandEmbed], ephemeral: false };
}

async function displayVoteLink() {
	const embed = new EmbedBuilder()
		.setColor('#5865F2')
		.setTitle('🗳️ Votez pour PokéFarm sur Top.gg !')
		.setDescription(
			'Merci de soutenir le bot en votant pour lui sur Top.gg. Votre vote nous aide à être plus visibles !\n\n' +
			'💎 **Récompense spéciale :**\n' +
			'Votez tous les jours pendant **7 jours d\'affilée** et obtenez le **Premium gratuitement** ! 🎁\n\n' +
			'👉 [Cliquez ici pour voter](https://top.gg/bot/1142325515575889971)'
		)
		.setTimestamp();

	return { embeds: [embed] };
}

async function saveBugIdea(interaction, type) {
	const data = {
		idTrainer: interaction.user.id,
		message: interaction.options.getString('description'),
		type: type,
	};
	let response = await API.post(`/bugs-ideas`, data);
	if (response.data.status === 'success') {
		// Envoyer dans le channel console pour les bugs et les idées
		try {
			const title = type === 'bug' ? '🐛 Nouveau bug signalé' : '💡 Nouvelle idée proposée';
			await sendToConsoleChannel(
				interaction.client,
				type,
				title,
				interaction.options.getString('description'),
				{
					userId: interaction.user.id,
					serverId: interaction.guild?.id,
					userName: interaction.user.tag
				}
			);
		} catch (error) {
			// On continue même si l'envoi au channel console échoue
			console.error('Erreur lors de l\'envoi au channel console:', error);
		}
		return `Merci pour votre ${type === 'bug' ? 'rapport de bug' : 'idée'} ! Nous l'avons bien reçu et nous allons l'examiner.`;
	} else if (response.data.status === 'alreadySent') {
		return `Vous avez déjà envoyé un${type === 'bug' ? ' rapport de bug' : 'e idée'} récemment. Merci de patienter avant d'en envoyer un nouveau.`;
	} else {
		return `Une erreur est survenue lors de l'envoi de votre ${type === 'bug' ? 'rapport de bug' : 'idée'}. Veuillez réessayer plus tard.`;
	}
}

async function getPokedexList(interaction, type) {
	if (!(await getIsPremium(interaction.user.id))) {
		const { embeds, files, components } = await premiumEmbed();
		return { embeds, files, components };
	}
	// UPDATEGENERATION: Update the number of pokemons by generation
	const generationList = [1, 2, 3, 4];
	const numberPokemonByGeneration = {
		1: { name: 'Kanto', number: 151 },
		2: { name: 'Johto', number: 100 },
		3: { name: 'Hoenn', number: 135 },
		4: { name: 'Sinnoh', number: 107 },
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

		const embed = new EmbedBuilder().setColor('#B8860B');
		let content = '';
		let files = [];

		if (response.data.status === 'alreadyGift') {
			content = `Vous pourrez en recevoir un nouveau dans ${formatRemainingTime(
				response.data.remainning
			)}.`;

			const attachment = new AttachmentBuilder(`./assets/nogift.png`);
			embed
				.setTitle('Vous avez déjà reçu un cadeau.')
				.setDescription(content)
				.setColor('#6b5a2c')
				.setThumbnail(`attachment://nogift.png`);
			files.push(attachment);

			if (!response.data.isPremium && !response.data.isStreakPremium) {
				embed.setFooter({
					text: '💎 Les cadeaux passent de 12h à 4h pour les membres Premium ! 💎',
				});
			}

			return { embeds: [embed], files };
		}

		embed.setTitle('Vous avez reçu un cadeau !');

		if (response.data.status === 'successMoney') {
			content = `Vous avez reçu ${response.data.amount} pokédollars.`;
			const attachment = new AttachmentBuilder(`./assets/gift.png`);
			embed.setThumbnail(`attachment://gift.png`);
			files.push(attachment);
		} else if (response.data.status === 'successBall') {
			const fallbackEmojiByBall = { pokeball: '🔴', superball: '🔵', hyperball: '⚫', masterball: '🟣' };
			const emojiBall = interaction.guild.emojis.cache.find(
				(emoji) => emoji.name === response.data.pokeball.name
			);
			const emojiDisplay = emojiBall ? emojiBall.toString() : (fallbackEmojiByBall[response.data.pokeball.name] || '⚪');
			content = `Vous avez reçu ${response.data.quantity} ${emojiDisplay}.`;
			const attachment = new AttachmentBuilder(`./assets/gift.png`);
			embed.setThumbnail(`attachment://gift.png`);
			files.push(attachment);
		} else if (response.data.status === 'successPokemon') {
			content = `Vous avez reçu un ${response.data.pokemon.name} ${hasStar(response.data.isShiny)}.`;
			const imageUrl = response.data.isShiny
				? response.data.pokemon.imgShiny
				: response.data.pokemon.img;
			embed.setThumbnail(imageUrl);
		}

		embed.setDescription(content);
		return { embeds: [embed], files };
	} catch (error) {
		console.error(error);
	}
}



async function getPokedex(interaction, type) {
	// UPDATEGENERATION: Update the number of pokemons by generation
	const numberPokemonByGeneration = {
		1: 151,
		2: 100,
		3: 135,
		4: 107,
	};

	let isReverse = type.endsWith('-reverse');
	let isShiny = type.startsWith('shiny');

	if (isReverse && !(await getIsPremium(interaction.user.id))) {
		const { embeds, files, components } = await premiumEmbed();
		return { embeds, files, components };
	}

	let generation = interaction.options.getInteger('generation');
	if (generation == null) {
		// UPDATEGENERATION: Update the category name for each generation
		const categoryNameForGeneration = {
			'🗺️・kanto': 1,
			'🗺️・johto': 2,
			'🗺️・hoenn': 3,
			'🗺️・sinnoh': 4,
		};
		generation = categoryNameForGeneration[interaction.channel.parent.name] ?? 1;
	}

	let user = interaction.options.getUser('dresseur') ?? interaction.user;
	let sameUser = user.id !== interaction.user.id;
	try {
		const response = await API.get(`/pokemon/trainer/` + user.id + '/' + generation + '/' + type);
		const pokemons = response.data.pokemon;
		let items = pokemons.map((pokemon) => `- ${!isReverse ? pokemon.quantity : ''} ${pokemon.name}`);
		let title = '';
		let footer = '';

		if (pokemons.length === 0) {
			if (!isReverse) {
				return (
					`${sameUser ? `${user.globalName} n'a` : `Vous n'avez`} pas encore de Pokémon` +
					(isShiny ? ' shiny' : '') +
					'.'
				);
			} else {
				return `Vous avez déjà tous les Pokémon` + (isShiny ? ' shiny ' : ' ') + 'de cette génération.';
			}
		}

		if (!isReverse) {
			title = `${sameUser ? `${user.globalName} a` : 'Vous avez'} ${response.data.sumPokemon
				} Pokémon${hasStar(isShiny)}, dont ${response.data.countPokemon} différents.`;
			footer = `${isShiny ? 'Shiny' : 'Poke'}dex de ${user.globalName} - ${response.data.countPokemon}/${numberPokemonByGeneration[generation]
				}`;
		} else {
			title = `Il vous manque ${response.data.countPokemon} Pokémon${hasStar(isShiny)}.`;
			footer = `${isShiny ? 'Shiny' : 'Poke'}dex inversé de ${user.globalName} - ${response.data.countPokemon
				}/${numberPokemonByGeneration[generation]}`;
		}

		let embed = createListEmbed(
			items,
			title,
			footer,
			user.displayAvatarURL({ format: 'png', dynamic: true }),
			null,
			isShiny ? '#FFED00' : '#FF0000'
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

async function getIsPremium(idTrainer) {
	try {
		const response = await API.get(`/trainer/` + idTrainer);
		return response.data.isPremium || response.data.isStreakPremium;
	} catch (error) {
		console.error(error);
	}
}

async function useAffiliateCode(idTrainer, affiliateCode) {
	try {
		const { data } = await API.post(`/trainer/affiliate`, { idTrainer, affiliateCode });

		switch (data.status) {
			case 'noExistCode':
				return "Ce code d'affiliation n'existe pas.";
			case 'alreadyAffiliate':
				return "Vous avez déjà utilisé un code d'affiliation.";
			case 'sameTrainer':
				return "Vous ne pouvez pas utiliser votre propre code d'affiliation.";
			case 'success':
				return `Vous avez reçu 10 000 pokédollars en utilisant le code d'affiliation de ${upFirstLetter(
					data.name
				)}`;
			default:
				return 'Une erreur est survenue.';
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
				`Pour obtenir plus d'argent, vendez des Pokémon en utilisant les commandes **\`/vendre\`** ou **\`/vendre-shiny\`**`
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

async function handleCatch(interaction, idPokeball) {
	const idPokemonWild = interaction.customId.split('|')[1];
	const idTrainer = interaction.user.id;

	const response = await catchPokemon(idPokemonWild, idTrainer, idPokeball);

	const originalEmbed = interaction.message.embeds[0];
	const newEmbed = new EmbedBuilder()
		.setTitle(originalEmbed.title)
		.setThumbnail(originalEmbed.thumbnail?.url);

	let secondOriginalEmbed = null;
	const newEmbed2 = new EmbedBuilder();
	if (interaction.message.embeds.length > 1) {
		secondOriginalEmbed = interaction.message.embeds[1];
		newEmbed2
			.setTitle(secondOriginalEmbed.title)
			.setThumbnail(secondOriginalEmbed.thumbnail?.url)
			.setDescription(secondOriginalEmbed.description)
			.setColor(secondOriginalEmbed.color ?? null)
			.addFields(secondOriginalEmbed.fields ?? []);
	}

	let attempts = parseInt(originalEmbed.fields?.[0]?.value ?? '0', 10) || 0;
	let replyMessage = '';
	let disabled = false;

	switch (response.status) {
		case 'noCatch':
			newEmbed.setColor(originalEmbed.color ?? null);
			replyMessage = `${response.pokemonName} s'est échappé, réessayez !`;
			attempts += 1;
			disabled = false;
			break;

		case 'catch':
			newEmbed.setColor('#3aa12f');
			if (secondOriginalEmbed) newEmbed2.setColor('#3aa12f');
			replyMessage = `${response.pokemonName} a été attrapé par <@${interaction.user.id}>.`;
			attempts += 1;
			disabled = true;
			break;

		case 'escape':
			newEmbed.setColor('#c71a28');
			if (secondOriginalEmbed) newEmbed2.setColor('#c71a28');
			replyMessage = `${response.pokemonName} s'est échappé! dommage`;
			attempts += 1;
			disabled = true;
			break;

		case 'alreadyCatch':
			newEmbed.setColor(originalEmbed.color ?? null);
			replyMessage = `Le Pokémon a déjà été attrapé.`;
			disabled = true;
			break;

		case 'alreadyEscape':
			replyMessage = `Le Pokémon s'est déjà échappé.`;
			disabled = true;
			break;

		case 'noBall':
			newEmbed.setColor(originalEmbed.color ?? null);
			replyMessage = `Vous n'avez pas de ${balls.find((b) => b.id === idPokeball).name}.`;
			disabled = false;
			break;

		case 'noExistPokemon':
			newEmbed.setColor(originalEmbed.color ?? null);
			replyMessage = `Le Pokémon a disparu.`;
			disabled = true;
			break;

		default:
			replyMessage = 'An unexpected error occurred.';
			disabled = false;
	}

	newEmbed
		.setDescription(replyMessage)
		.addFields({ name: 'Tentatives', value: String(attempts), inline: true });

	const components = [await buildFreshBallRow(interaction.guild, idPokemonWild, disabled)];

	const responsePayload = { embeds: [newEmbed], components };
	if (secondOriginalEmbed) responsePayload.embeds.push(newEmbed2);

	await interaction.update(responsePayload);

	if (response.status !== 'noCatch' && response.status !== 'noBall') {
		await findRandomPokemon(interaction, true);
	} else if (response.status === 'noBall') {
		const now = Date.now();
		const cooldownAmount = 10000;
		if (shopCooldowns.get(interaction.user.id) > now) return;
		shopCooldowns.set(interaction.user.id, now + cooldownAmount);
		setTimeout(() => shopMessage(interaction), 500);
	}
}

async function shopMessage(interaction, needReply = false) {
	const response = await API.get(`/trainer/` + interaction.user.id);

	const channel = interaction.channel;

	const attachment = new AttachmentBuilder(`./assets/shop.png`);

	const pokeballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'pokeball');
	const superballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'superball');
	const hyperballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'hyperball');
	const masterballEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'masterball');
	const fallbackEmojiByBall = { pokeball: '🔴', superball: '🔵', hyperball: '⚫', masterball: '🟣' };
	const pokeballDisplay = pokeballEmoji ? pokeballEmoji.toString() : fallbackEmojiByBall.pokeball;
	const superballDisplay = superballEmoji ? superballEmoji.toString() : fallbackEmojiByBall.superball;
	const hyperballDisplay = hyperballEmoji ? hyperballEmoji.toString() : fallbackEmojiByBall.hyperball;
	const masterballDisplay = masterballEmoji ? masterballEmoji.toString() : fallbackEmojiByBall.masterball;

	const title = needReply
		? 'Bienvenue à la boutique de Pokéballs !'
		: "Vous n'avez pas de Pokéballs ? Pas de problème !";

	const priceEmbed = new EmbedBuilder()
		.setColor('#FFFFFF')
		.setTitle(title)
		.setDescription(
			`Vous avez actuellement : ${formatNombreAvecSeparateur(response.data.money)} $.\n\n` +
			`${pokeballDisplay} Pokeball : 50 $\n\n` +
			`${superballDisplay} Superball : 80 $\n\n` +
			`${hyperballDisplay} Hyperball : 150 $\n\n` +
			`${masterballDisplay} Masterball : 100 000 $\n\n`
		)
		.setThumbnail(`attachment://shop.png`);

	let rows = [];
	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];

	for (let i = 10; i <= 1000; i *= 10) {
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			if (ball === 'masterball' && i == 1000) {
				return;
			}
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			let number = ball === 'masterball' ? i / 10 : i;
			const button = new ButtonBuilder()
				.setCustomId('buy|' + number + '|' + ball)
				.setStyle(ButtonStyle.Secondary)
				.setLabel('' + number)
				.setEmoji(customEmoji ? customEmoji.id : fallbackEmojiByBall[ball]);

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
				`**${upFirstLetter(interaction.user.username)} veux échanger ${quantityPokemonPropose} ${upFirstLetter(pokemonPropose) + hasStar(pokemonProposeShiny)
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
		const title = `Vous avez ${sumRune} rune${sumRune > 1 ? 's' : ''} de Pokémon${countRune > 1 ? `, dont ${response.data.countRune} différentes.` : '.'
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

async function sendInstallationMessage(guild, owner) {
	try {
		const embed = new EmbedBuilder()
			.setColor('#3eb0ed')
			.setTitle(`Merci d'avoir installé le bot sur ${guild.name} !`)
			.setDescription(
				"Pour terminer l'installation, utilisez la commande `!install` dans un salon de votre serveur (pas en réponse à ce message)."
			)
			.addFields(
				{
					name: 'Ce que fait !install',
					value:
						'- Crée la catégorie `PokeFarm` avec 4 forums (Kanto, Johto, Hoenn, Sinnoh)\n' +
						'- Crée les posts de zones et prépare les spawns\n' +
						"- Configure les permissions nécessaires",
				},
				{
					name: 'Pré‑requis émojis',
					value:
						"- Assurez‑vous d'avoir au moins **4 emplacements d'émojis libres** (pokeball, superball, hyperball, masterball).\n" +
						"- Si nécessaire, vous pourrez (ré)installer les emojis plus tard avec `!addBallEmojis`.",
				},
				{
					name: 'Aide',
					value: '- Tapez `/help` sur le serveur pour voir toutes les commandes.',
				},
				{
					name: 'Informations complémentaires',
					value: "- L'installation prend environ 15 minutes. Le bot fera des pauses lors de la création des forums.\n" +
						"- L'ensemble de l'air de jeu est installé en bas de votre serveur. Le bot ne va donc pas désordonner votre serveur."
				},
			)
			.setFooter({ text: 'Bon jeu !' });

		await owner.send({ embeds: [embed] });
	} catch (error) {
		await logEvent('ERROR', 'installation', `Erreur lors de l'envoi du message d'installation: ${error.message}`, guild.id, guild.ownerId);
	}
}

async function cleanupInactiveUsers(client) {
	try {
		await logEvent('INFO', 'cleanup', 'Début du nettoyage automatique des utilisateurs inactifs', null, null);
		const allActiveUsers = new Set();
		let totalServers = 0;
		let totalUsers = 0;

		// Récupérer tous les utilisateurs actifs sur tous les serveurs
		for (const [guildId, guild] of client.guilds.cache) {
			try {
				// Fetch tous les membres du serveur
				await guild.members.fetch();

				// Ajouter tous les utilisateurs non-bot à la liste
				guild.members.cache.forEach(member => {
					if (!member.user.bot) {
						allActiveUsers.add(member.id);
					}
				});

				totalServers++;
				totalUsers += guild.members.cache.filter(m => !m.user.bot).size;
			} catch (error) {
				await logEvent('ERROR', 'cleanup', `Erreur lors du fetch des membres pour ${guild.name} (${guildId}): ${error.message}`, guildId, null);
			}
		}

		// Convertir le Set en Array pour l'API
		const activeUserIds = Array.from(allActiveUsers);

		// Envoyer à l'API pour nettoyage
		const response = await API.post('/trainer/cleanup-inactive', {
			activeUserIds: activeUserIds
		});

		await logEvent('SUCCESS', 'cleanup', `Nettoyage terminé: ${activeUserIds.length} actifs sur ${totalServers} serveurs`, null, null);

		return {
			success: true,
			activeUsers: activeUserIds.length,
			totalServers: totalServers
		};

	} catch (error) {
		await logEvent('ERROR', 'cleanup', `Erreur lors du nettoyage: ${error.message}`, null, null);
		return {
			success: false,
			error: error.message
		};
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
	getIsPremium,
	premiumDisplay,
	welcomeTrainer,
	premiumUrl,
	buyBalls,
	displayHelp,
	saveBugIdea,
	displayVoteLink,
	sendInstallationMessage,
	cleanupInactiveUsers,
};
