const commandsPokechat = [
	{
		name: 'argent',
		description: 'Affiche votre argent',
	},
	{
		name: 'pokedex',
		description: "Affiche votre pokedex ou celui d'un dresseur",
		options: [
			{
				name: 'dresseur',
				type: 6,
				description: 'Nom du dresseur',
				required: false,
			},
		],
	},
	{
		name: 'shinydex',
		description: "Affiche votre shinydex ou celui d'un dresseur",
		options: [
			{
				name: 'dresseur',
				type: 6,
				description: 'Nom du dresseur',
				required: false,
			},
		],
	},
	{
		name: 'ball',
		description: 'Affiche vos pokéballs',
	},
	{
		name: 'evolution',
		description: 'Fait évoluer un pokémon',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'evolution-shiny',
		description: 'Fait évoluer un pokémon shiny',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'zone',
		description: 'Affiche les zones disponibles pour un pokémon',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'vendre',
		description: 'Vendre un / des pokémon(s)',
		options: [
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon',
				required: true,
			},
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'vendre-shiny',
		description: 'Vendre un / des pokémon(s) shiny',
		options: [
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon',
				required: true,
			},
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'prix',
		description: "Affiche le prix d'une pokéball ou d'un pokémon",
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom de la pokéball ou du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'nombre-evolution',
		description: 'Affiche le nombre de pokémon necessaire pour une évolution',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon à faire évoluer',
				required: true,
			},
		],
	},
	{
		name: 'cherche',
		description: 'Cherche un pokémon',
	},
	{
		name: 'canne',
		description: 'Pêche un pokémon avec la canne',
	},
	{
		name: 'super-canne',
		description: 'Pêche un pokémon avec la super canne',
	},
	{
		name: 'mega-canne',
		description: 'Pêche un pokémon avec la mega canne',
	},
	{
		name: 'disponible',
		description: 'Affiche les pokémons disponibles sur le salon',
	},
	{
		name: 'rune-achat',
		description:
			"Achète une rune d'un pokémon, pour le faire spawn (prix: 3X le prix de vente du pokémon)",
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de rune de pokémon à acheter',
				required: false,
			},
		],
	},
	{
		name: 'rune-utiliser',
		description: 'Utilise une rune de pokémon',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'rune-inventaire',
		description: 'Affiche la liste de vos runes de pokémon',
	},
	{
		name: 'rune-prix',
		description: "Affiche le prix d'une rune de pokémon",
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'echange',
		description: 'Echange un pokémon avec un autre dresseur',
		options: [
			{
				name: 'quantité_pokemon_propose',
				type: 4,
				description: 'Quantité de pokémon que vous voulez échanger',
				required: true,
			},
			{
				name: 'nom_pokemon_propose',
				type: 3,
				description: 'Nom du pokémon que vous voulez échanger',
				required: true,
			},
			{
				name: 'quantité_pokemon_demande',
				type: 4,
				description: 'Quantité de pokémon que vous voulez recevoir',
				required: true,
			},
			{
				name: 'nom_pokemon_demande',
				type: 3,
				description: 'Nom du pokémon que vous voulez recevoir',
				required: true,
			},
		],
	},
];

const balls = [
	{ name: 'pokeball', id: 1 },
	{ name: 'superball', id: 2 },
	{ name: 'hyperball', id: 3 },
	{ name: 'masterball', id: 4 },
];

export { commandsPokechat, balls };
