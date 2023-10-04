const commandsPokechat = [
	{
		name: 'argent',
		description: 'Affiche votre argent',
	},
	{
		name: 'pokedex',
		description: 'Affiche votre pokedex',
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
];

const balls = [
	{ name: 'pokeball', id: 1 },
	{ name: 'superball', id: 2 },
	{ name: 'hyperball', id: 3 },
	{ name: 'masterball', id: 4 },
];

export { commandsPokechat, balls };
