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
				autocomplete: true,
			},
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon à faire évoluer',
				required: false,
			},
			{
				name: 'max',
				type: 3,
				description: 'Faire évoluer le maximum de pokémon possible',
				required: false,
				choices: [
					{ name: 'Oui', value: 'true' },
					{ name: 'Non', value: 'false' },
				],
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
				autocomplete: true,
			},
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon à faire évoluer',
				required: false,
			},
			{
				name: 'max',
				type: 3,
				description: 'Faire évoluer le maximum de pokémon possible',
				required: false,
				choices: [
					{ name: 'Oui', value: 'true' },
					{ name: 'Non', value: 'false' },
				],
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
				autocomplete: true,
			},
		],
	},
	{
		name: 'vendre',
		description: 'Vendre un / des pokémon(s)',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
				autocomplete: true,
			},
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon',
				required: false,
			},
			{
				name: 'max',
				type: 3,
				description: 'Faire évoluer le maximum de pokémon possible',
				required: false,
				choices: [
					{ name: 'Oui', value: 'true' },
					{ name: 'Non', value: 'false' },
				],
			},
		],
	},
	{
		name: 'vendre-shiny',
		description: 'Vendre un / des pokémon(s) shiny',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
				autocomplete: true,
			},
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon',
				required: false,
			},
			{
				name: 'max',
				type: 3,
				description: 'Faire évoluer le maximum de pokémon possible',
				required: false,
				choices: [
					{ name: 'Oui', value: 'true' },
					{ name: 'Non', value: 'false' },
				],
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
				autocomplete: true,
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
				autocomplete: true,
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
				autocomplete: true,
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
				autocomplete: true,
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
				autocomplete: true,
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
				autocomplete: true,
			},
			{
				name: 'pokemon_propose_shiny',
				type: 3,
				description: 'Le pokémon que vous proposez est-il shiny ?',
				required: true,
				choices: [
					{ name: 'Oui', value: 'true' },
					{ name: 'Non', value: 'false' },
				],
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
				autocomplete: true,
			},
			{
				name: 'pokemon_demande_shiny',
				type: 3,
				description: 'Le pokémon que vous voulez recevoir est-il shiny ?',
				required: true,
				choices: [
					{ name: 'Oui', value: 'true' },
					{ name: 'Non', value: 'false' },
				],
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

const pokemons = [
	'Bulbizarre',
	'Herbizarre',
	'Florizarre',
	'Salamèche',
	'Reptincel',
	'Dracaufeu',
	'Carapuce',
	'Carabaffe',
	'Tortank',
	'Chenipan',
	'Chrysacier',
	'Papilusion',
	'Aspicot',
	'Coconfort',
	'Dardargnan',
	'Roucool',
	'Roucoups',
	'Roucarnage',
	'Rattata',
	'Rattatac',
	'Piafabec',
	'Rapasdepic',
	'Abo',
	'Arbok',
	'Pikachu',
	'Raichu',
	'Sabelette',
	'Sablaireau',
	'NidoranF',
	'Nidorina',
	'Nidoqueen',
	'NidoranM',
	'Nidorino',
	'Nidoking',
	'Mélofée',
	'Mélodelfe',
	'Goupix',
	'Feunard',
	'Rondoudou',
	'Grodoudou',
	'Nosferapti',
	'Nosferalto',
	'Mystherbe',
	'Ortide',
	'Rafflesia',
	'Paras',
	'Parasect',
	'Mimitoss',
	'Aéromite',
	'Taupiqueur',
	'Triopikeur',
	'Miaouss',
	'Persian',
	'Psykokwak',
	'Akwakwak',
	'Férosinge',
	'Colossinge',
	'Caninos',
	'Arcanin',
	'Ptitard',
	'Têtarte',
	'Tartard',
	'Abra',
	'Kadabra',
	'Alakazam',
	'Machoc',
	'Machopeur',
	'Mackogneur',
	'Chétiflor',
	'Boustiflor',
	'Empiflor',
	'Tentacool',
	'Tentacruel',
	'Racaillou',
	'Gravalanch',
	'Grolem',
	'Ponyta',
	'Galopa',
	'Ramoloss',
	'Flagadoss',
	'Magnéti',
	'Magnéton',
	'Canarticho',
	'Doduo',
	'Dodrio',
	'Otaria',
	'Lamantine',
	'Tadmorv',
	'Grotadmorv',
	'Kokiyas',
	'Crustabri',
	'Fantominus',
	'Spectrum',
	'Ectoplasma',
	'Onix',
	'Soporifik',
	'Hypnomade',
	'Krabby',
	'Krabboss',
	'Voltorbe',
	'Électrode',
	'Noeunoeuf',
	'Noadkoko',
	'Osselait',
	'Ossatueur',
	'Kicklee',
	'Tygnon',
	'Excelangue',
	'Smogo',
	'Smogogo',
	'Rhinocorne',
	'Rhinoféros',
	'Leveinard',
	'Saquedeneu',
	'Kangourex',
	'Hypotrempe',
	'Hypocéan',
	'Poissirène',
	'Poissoroy',
	'Stari',
	'Staross',
	'M. Mime',
	'Insécateur',
	'Lippoutou',
	'Élektek',
	'Magmar',
	'Scarabrute',
	'Tauros',
	'Magicarpe',
	'Léviator',
	'Lokhlass',
	'Métamorph',
	'Évoli',
	'Aquali',
	'Voltali',
	'Pyroli',
	'Porygon',
	'Amonita',
	'Amonistar',
	'Kabuto',
	'Kabutops',
	'Ptéra',
	'Ronflex',
	'Artikodin',
	'Électhor',
	'Sulfura',
	'Minidraco',
	'Draco',
	'Dracolosse',
	'Mewtwo',
	'Mew',
];

export { commandsPokechat, balls, pokemons };
