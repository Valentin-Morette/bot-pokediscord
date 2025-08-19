import { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

function buyMeACoffeeEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle('🌟 Soutenez le serveur sur Buy Me a Coffee ! 🌟')
		.setDescription(
			'Maintenir le bot actif implique des coûts. En achetant un café sur Buy Me a Coffee, vous contribuez à couvrir ces dépenses et à continuer de proposer un jeu gratuit et de qualité. Chaque café compte ! Merci pour votre soutien ! ☕'
		)
		.addFields({
			name: '🔗 Lien Buy Me a Coffee',
			value: 'https://buymeacoffee.com/birious',
		})
		.setColor(color)
		.setThumbnail(
			'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGI4ZWsxaWl2MTc1enF1cnZ4cnAydWlraWFpMXl2bXg2dTc3bGxyZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/TDQOtnWgsBx99cNoyH/giphy.gif'
		);

	return { embeds: [embed], files: [] };
}

function instantGamingEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle('🎮 Instant Gaming 🎮')
		.setDescription(
			'Vous cherchez des jeux à petits prix ? Instant Gaming propose des jeux PC, PS4, Xbox, et bien plus, à des prix imbattables. En achetant vos jeux via ce lien, vous soutenez le serveur et le bot. Merci pour votre soutien ! 🎮'
		)
		.addFields({
			name: '🔗 Lien Instant Gaming',
			value: 'https://www.instant-gaming.com/?igr=seriousnintendo',
		})
		.setColor(color)
		.setThumbnail('https://seeklogo.com/images/I/instant-gaming-logo-5931E64B57-seeklogo.com.png');

	return { embeds: [embed], files: [] };
}

function XEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle('🌐 Suivez-nous sur X ! 🌐')
		.setDescription(
			'Restez informé des dernières statistiques du bot ! Découvrez combien de Pokémon sont apparus, capturés et échappés chaque jour. Ne manquez aucune mise à jour et rejoignez la communauté ! 🚀'
		)
		.addFields({
			name: '🔗 Suivez-nous ici',
			value: 'https://x.com/pokDiscord',
		})
		.setColor(color)
		.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/e/e6/Twitter-new-logo.jpg');

	return { embeds: [embed], files: [] };
}

function GamsGoEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle("💰 Jusqu'à -75% sur vos abonnements ! 💰")
		.setDescription(
			"Profitez de **Netflix, Spotify, Disney+ et bien plus** à prix réduit grâce à **GamsGo**, la plateforme de partage d'abonnements ! 🎉\n\n" +
			"👉 **Jusqu'à 10 jours gratuits** en passant par ce lien :\n"
		)
		.addFields({
			name: '🔗 Lien GamsGo',
			value: 'https://fr.gamsgo.com/share/7vu8T',
		})
		.setColor(color)
		.setThumbnail(
			'https://external-preview.redd.it/9YItORrxXBGN2DPzfgGh7OrkLvXVWHMWvOsQvCQ7sU4.jpg?width=640&crop=smart&auto=webp&s=f7a46fd0a31792ecd2ece3cea719f869849e6c02'
		);

	return { embeds: [embed], files: [] };
}


async function premiumAdEmbed(color) {
	const attachment = new AttachmentBuilder('./assets/premium.png');
	const embed = new EmbedBuilder()
		.setTitle('💎 Découvrez l’offre Premium ! 💎')
		.setDescription(
			`Envie de profiter pleinement du bot et de débloquer des fonctionnalités exclusives ?\n\n` +
			'**Avantages Premium :**\n' +
			'- Accès à des commandes exclusives.\n' +
			'- Plus de contenus avec certaines commandes.\n' +
			'- Pas de publicités sur vos commandes.\n' +
			'- Commande /cadeau disponible toutes les 4h au lieu de 12h.\n\n' +
			`Le tout pour seulement **3,99€ en une fois** !\n\n` +
			`➡️ Pour en savoir plus ou le devenir, tapez la commande **/premium** sur ce serveur.`
		)
		.setColor(color)
		.setThumbnail('attachment://premium.png');

	return { embeds: [embed], files: [attachment] };
}

async function premiumEmbed(isCmd = false) {
	const attachment = new AttachmentBuilder('./assets/premium.png');
	const embed = new EmbedBuilder()
		.setTitle('💎 Devenez Premium ! 💎')
		.setDescription(
			`${isCmd ? '' : 'Cette commande est réservée aux membres Premium. '}` +
			`Passez en Premium et profitez d’avantages exclusifs, valables **sur tous les serveurs où le bot est présent** ! 🚀\n\n` +
			'**Avantages Premium :**\n' +
			'- Accès à des commandes exclusives : `/chance-shiny`, `/chance-capture`, `/pokedex-list`, `/shinydex-list`, `/pokedex-inverse`, `/shinydex-inverse`.\n' +
			'- Les commandes `/zone` et `/disponible` sont enrichies avec les **taux de spawn**.\n' +
			'- Zéro publicité dans vos commandes.\n' +
			'- Commande `/cadeau` disponible toutes les **4h** (au lieu de 12h).\n\n' +
			`Le tout pour seulement **3,99€ en un seul paiement** !`
		)
		.setColor('#FFCC00')
		.setThumbnail('attachment://premium.png');

	let row = new ActionRowBuilder();
	const button = new ButtonBuilder()
		.setCustomId('premium')
		.setStyle(ButtonStyle.Primary)
		.setEmoji('💎')
		.setLabel('Devenir Premium');
	row.addComponents(button);

	return { embeds: [embed], files: [attachment], components: [row] };
}


async function alsoPremiumEmbed() {
	const attachment = new AttachmentBuilder('./assets/premium.png');
	const embed = new EmbedBuilder()
		.setTitle('💎 Vous êtes déjà Premium ! 💎')
		.setDescription(
			'Vous avez déjà soutenu le serveur et le bot en devenant Premium. Merci pour votre soutien !\n'
		)
		.setColor('#FFCC00')
		.setThumbnail('attachment://premium.png');

	return { embeds: [embed], files: [attachment] };
}

async function inviteEmbed(color) {
	const embed = new EmbedBuilder()
		.setTitle('🚀 Installez le Bot Pokémon sur votre serveur !')
		.setDescription(
			`Envie d'explorer les régions Pokémon avec vos amis ? 🎮\n\n` +
			`Ajoutez le bot dès maintenant sur **votre propre serveur Discord** !\n\n` +
			'**Fonctionnalités automatiques :**\n' +
			'- Création d’une catégorie dédiée avec 4 forums (Kanto, Johto, Hoenn, Sinnoh).\n' +
			'- Installation des zones (Forêt de Jade, Mont Abrupt, Temple Frimapic, etc.) en un clic.\n' +
			'- Système complet de capture, échanges, évolutions et gestion des Balls.\n\n' +
			`👉 [Cliquez ici pour inviter le bot](https://discord.com/oauth2/authorize?client_id=1142325515575889971&permissions=398358604880&integration_type=0&scope=bot)`
		)
		.setColor(color)
		.setThumbnail('https://images.seeklogo.com/logo-png/40/1/discord-white-logo-png_seeklogo-403999.png')
	return { embeds: [embed], files: [] };
}



export { buyMeACoffeeEmbed, instantGamingEmbed, XEmbed, GamsGoEmbed, premiumEmbed, alsoPremiumEmbed, premiumAdEmbed, inviteEmbed };
