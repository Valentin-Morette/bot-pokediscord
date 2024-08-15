const commandsPokechat = [
	{
		name: 'money',
		description: 'Displays your money',
	},
	{
		name: 'pokedex',
		description: 'Displays your Pokedex or that of a trainer',
		options: [
			{
				name: 'trainer',
				type: 6,
				description: 'Trainer name',
				required: false,
			},
		],
	},
	{
		name: 'shinydex',
		description: 'Displays your ShinyDex or that of a trainer',
		options: [
			{
				name: 'trainer',
				type: 6,
				description: 'Trainer name',
				required: false,
			},
		],
	},
	{
		name: 'ball',
		description: 'Displays your Pokeballs',
	},
	{
		name: 'evolution',
		description: 'Evolves a Pokemon',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
			{
				name: 'max',
				type: 3,
				description: 'Evolve the maximum number of Pokemon possible',
				required: false,
				choices: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
			},
			{
				name: 'quantity',
				type: 4,
				description: 'Number of Pokemon to evolve',
				required: false,
			},
		],
	},
	{
		name: 'evolution-shiny',
		description: 'Evolves a shiny Pokemon',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
			{
				name: 'max',
				type: 3,
				description: 'Evolve the maximum number of Pokemon possible',
				required: false,
				choices: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
			},
			{
				name: 'quantity',
				type: 4,
				description: 'Number of Pokemon to evolve',
				required: false,
			},
		],
	},
	{
		name: 'zone',
		description: 'Displays available zones for a Pokemon',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'sell',
		description: 'Sell one or more Pokemon',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
			{
				name: 'max',
				type: 3,
				description: 'Sell the maximum number of Pokemon possible, leaving 1',
				required: false,
				choices: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
			},
			{
				name: 'quantity',
				type: 4,
				description: 'Quantity of Pokemon',
				required: false,
			},
		],
	},
	{
		name: 'sell-shiny',
		description: 'Sell one or more shiny Pokemon',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
			{
				name: 'max',
				type: 3,
				description: 'Sell the maximum number of shiny Pokemon possible, leaving 1',
				required: false,
				choices: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
			},
			{
				name: 'quantity',
				type: 4,
				description: 'Quantity of Pokemon',
				required: false,
			},
		],
	},
	{
		name: 'price',
		description: 'Displays the price of a Pokeball or a Pokemon',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Name of the Pokeball or Pokemon',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'number-evolution',
		description: 'Displays the number of Pokemon required for an evolution',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Name of the Pokemon to evolve',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'search',
		description: 'Searches for a Pokemon',
	},
	{
		name: 'rod',
		description: 'Fish for a Pokemon with the rod',
	},
	{
		name: 'super-rod',
		description: 'Fish for a Pokemon with the super rod',
	},
	{
		name: 'mega-rod',
		description: 'Fish for a Pokemon with the mega rod',
	},
	{
		name: 'available',
		description: 'Displays the available Pokemon in the channel',
	},
	{
		name: 'shop',
		description: 'Opens the Pokeball shop',
	},
	{
		name: 'quantity',
		description: 'Displays the quantity of Pokemon you own for a given name',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'quantity-shiny',
		description: 'Displays the quantity of shiny Pokemon you own for a given name',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'rune-buy',
		description: "Buys a Pokemon's rune to make it spawn (price: 3X the Pokemon's selling price)",
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
			{
				name: 'quantity',
				type: 4,
				description: 'Quantity of Pokemon runes to buy',
				required: false,
			},
		],
	},
	{
		name: 'rune-use',
		description: 'Uses a Pokemon rune',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'rune-inventory',
		description: 'Displays your list of Pokemon runes',
	},
	{
		name: 'rune-price',
		description: 'Displays the price of a Pokemon rune',
		options: [
			{
				name: 'name',
				type: 3,
				description: 'Pokemon name',
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: 'trade',
		description: 'Trades a Pokemon with another trainer',
		options: [
			{
				name: 'quantity_pokemon_offer',
				type: 4,
				description: 'Quantity of Pokemon you want to trade',
				required: true,
			},
			{
				name: 'name_pokemon_offer',
				type: 3,
				description: 'Name of the Pokemon you want to trade',
				required: true,
				autocomplete: true,
			},
			{
				name: 'pokemon_offer_shiny',
				type: 3,
				description: 'Is the Pokemon you are offering shiny?',
				required: true,
				choices: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
			},
			{
				name: 'quantity_pokemon_request',
				type: 4,
				description: 'Quantity of Pokemon you want to receive',
				required: true,
			},
			{
				name: 'name_pokemon_request',
				type: 3,
				description: 'Name of the Pokemon you want to receive',
				required: true,
				autocomplete: true,
			},
			{
				name: 'pokemon_request_shiny',
				type: 3,
				description: 'Is the Pokemon you want to receive shiny?',
				required: true,
				choices: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
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
	'Bulbasaur',
	'Ivysaur',
	'Venusaur',
	'Charmander',
	'Charmeleon',
	'Charizard',
	'Squirtle',
	'Wartortle',
	'Blastoise',
	'Caterpie',
	'Metapod',
	'Butterfree',
	'Weedle',
	'Kakuna',
	'Beedrill',
	'Pidgey',
	'Pidgeotto',
	'Pidgeot',
	'Rattata',
	'Raticate',
	'Spearow',
	'Fearow',
	'Ekans',
	'Arbok',
	'Pikachu',
	'Raichu',
	'Sandshrew',
	'Sandslash',
	'NidoranF',
	'Nidorina',
	'Nidoqueen',
	'NidoranM',
	'Nidorino',
	'Nidoking',
	'Clefairy',
	'Clefable',
	'Vulpix',
	'Ninetales',
	'Jigglypuff',
	'Wigglytuff',
	'Zubat',
	'Golbat',
	'Oddish',
	'Gloom',
	'Vileplume',
	'Paras',
	'Parasect',
	'Venonat',
	'Venomoth',
	'Diglett',
	'Dugtrio',
	'Meowth',
	'Persian',
	'Psyduck',
	'Golduck',
	'Mankey',
	'Primeape',
	'Growlithe',
	'Arcanine',
	'Poliwag',
	'Poliwhirl',
	'Poliwrath',
	'Abra',
	'Kadabra',
	'Alakazam',
	'Machop',
	'Machoke',
	'Machamp',
	'Bellsprout',
	'Weepinbell',
	'Victreebel',
	'Tentacool',
	'Tentacruel',
	'Geodude',
	'Graveler',
	'Golem',
	'Ponyta',
	'Rapidash',
	'Slowpoke',
	'Slowbro',
	'Magnemite',
	'Magneton',
	'Farfetch’d',
	'Doduo',
	'Dodrio',
	'Seel',
	'Dewgong',
	'Grimer',
	'Muk',
	'Shellder',
	'Cloyster',
	'Gastly',
	'Haunter',
	'Gengar',
	'Onix',
	'Drowzee',
	'Hypno',
	'Krabby',
	'Kingler',
	'Voltorb',
	'Electrode',
	'Exeggcute',
	'Exeggutor',
	'Cubone',
	'Marowak',
	'Hitmonlee',
	'Hitmonchan',
	'Lickitung',
	'Koffing',
	'Weezing',
	'Rhyhorn',
	'Rhydon',
	'Chansey',
	'Tangela',
	'Kangaskhan',
	'Horsea',
	'Seadra',
	'Goldeen',
	'Seaking',
	'Staryu',
	'Starmie',
	'Mr. Mime',
	'Scyther',
	'Jynx',
	'Electabuzz',
	'Magmar',
	'Pinsir',
	'Tauros',
	'Magikarp',
	'Gyarados',
	'Lapras',
	'Ditto',
	'Eevee',
	'Vaporeon',
	'Jolteon',
	'Flareon',
	'Porygon',
	'Omanyte',
	'Omastar',
	'Kabuto',
	'Kabutops',
	'Aerodactyl',
	'Snorlax',
	'Articuno',
	'Zapdos',
	'Moltres',
	'Dratini',
	'Dragonair',
	'Dragonite',
	'Mewtwo',
	'Mew',
];

export { commandsPokechat, balls, pokemons };
