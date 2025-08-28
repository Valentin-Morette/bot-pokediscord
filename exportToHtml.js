import fs from 'fs/promises';
import path from 'path';

/**
 * Convertit un fichier d'export JSON en HTML
 * @param {string} jsonFilePath - Chemin vers le fichier JSON d'export
 * @param {string} outputPath - Chemin de sortie pour le fichier HTML
 */
async function convertExportToHtml(jsonFilePath, outputPath = null) {
	try {
		// Lire le fichier JSON
		const jsonData = await fs.readFile(jsonFilePath, 'utf8');
		const data = JSON.parse(jsonData);

		if (!outputPath) {
			outputPath = jsonFilePath.replace('.json', '.html');
		}

		// Générer le HTML
		const html = generateHtml(data);

		// Sauvegarder le fichier HTML
		await fs.writeFile(outputPath, html, 'utf8');

		console.log(`✅ HTML généré avec succès : ${outputPath}`);
		return outputPath;

	} catch (error) {
		console.error('❌ Erreur lors de la conversion :', error);
		throw error;
	}
}

/**
 * Génère le HTML à partir des données d'export
 * @param {Object} data - Données d'export du canal
 * @returns {string} HTML généré
 */
function generateHtml(data) {
	const { messages, exportDate } = data;

	const html = `<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Patch Notes - PokéChat</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			background-color: #36393f;
			color: #dcddde;
			line-height: 1.6;
		}
		
		.container {
			max-width: 800px;
			margin: 0 auto;
			padding: 20px;
		}
		
		.header {
			text-align: center;
			margin-bottom: 40px;
			padding: 30px;
			background: linear-gradient(135deg, #5865f2 0%, #7289da 100%);
			border-radius: 15px;
			box-shadow: 0 4px 20px rgba(0,0,0,0.3);
		}
		
		.header h1 {
			font-size: 2.5em;
			margin-bottom: 10px;
			color: white;
			text-shadow: 0 2px 4px rgba(0,0,0,0.3);
		}
		
		.header .subtitle {
			font-size: 1.2em;
			opacity: 0.9;
			color: white;
		}
		
		.update-date {
			text-align: center;
			margin-bottom: 30px;
			padding: 15px;
			background: #2f3136;
			border-radius: 10px;
			border-left: 4px solid #5865f2;
		}
		
		.update-date .date {
			font-size: 1.1em;
			color: #b9bbbe;
		}
		
		.messages {
			display: flex;
			flex-direction: column;
			gap: 20px;
		}
		
		.message {
			background: #2f3136;
			border-radius: 10px;
			padding: 20px;
			border-left: 4px solid #5865f2;
			box-shadow: 0 2px 10px rgba(0,0,0,0.2);
		}
		
		.message-header {
			display: flex;
			align-items: center;
			margin-bottom: 15px;
			padding-bottom: 15px;
			border-bottom: 1px solid #40444b;
		}
		
		.avatar {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: linear-gradient(135deg, #5865f2, #7289da);
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			font-weight: bold;
			margin-right: 15px;
			font-size: 18px;
		}
		
		.author-info {
			flex: 1;
		}
		
		.author-name {
			font-weight: bold;
			color: #fff;
			font-size: 1.1em;
		}
		
		.message-time {
			color: #72767d;
			font-size: 0.9em;
			margin-top: 2px;
		}
		
		.message-content {
			color: #dcddde;
			white-space: pre-wrap;
			word-wrap: break-word;
			font-size: 1em;
			line-height: 1.7;
		}
		
		.message-content:empty::before {
			content: "(Message sans contenu)";
			color: #72767d;
			font-style: italic;
		}
		
		/* Styles pour le Markdown Discord */
		.message-content strong {
			color: #fff;
			font-weight: 600;
		}
		
		.message-content em {
			font-style: italic;
			color: #b9bbbe;
		}
		
		.message-content code {
			background: #40444b;
			color: #dcddde;
			padding: 2px 6px;
			border-radius: 4px;
			font-family: 'Consolas', 'Monaco', monospace;
			font-size: 0.9em;
		}
		
		.message-content pre {
			background: #40444b;
			color: #dcddde;
			padding: 15px;
			border-radius: 8px;
			overflow-x: auto;
			margin: 10px 0;
			border-left: 4px solid #5865f2;
		}
		
		.message-content pre code {
			background: none;
			padding: 0;
			color: inherit;
		}
		
		.attachments {
			margin-top: 15px;
			padding-top: 15px;
			border-top: 1px solid #40444b;
		}
		
		.attachment {
			display: inline-block;
			margin: 5px 10px 5px 0;
			padding: 8px 12px;
			background: #40444b;
			border-radius: 5px;
			text-decoration: none;
			color: #5865f2;
			font-size: 0.9em;
			transition: background-color 0.2s;
		}
		
		.attachment:hover {
			background: #4f545c;
		}
		
		.embed {
			margin-top: 15px;
			padding: 15px;
			background: #40444b;
			border-radius: 8px;
			border-left: 4px solid #43b581;
		}
		
		.embed-title {
			font-weight: bold;
			color: #fff;
			margin-bottom: 8px;
		}
		
		.embed-description {
			color: #b9bbbe;
			line-height: 1.5;
			margin-bottom: 10px;
		}
		
		.embed-fields {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 10px;
			margin-top: 10px;
		}
		
		.embed-field {
			background: #2f3136;
			padding: 8px;
			border-radius: 5px;
			border: 1px solid #40444b;
		}
		
		.embed-field-name {
			font-weight: bold;
			color: #fff;
			font-size: 0.9em;
			margin-bottom: 5px;
		}
		
		.embed-field-value {
			color: #b9bbbe;
			font-size: 0.9em;
		}
		
		@media (max-width: 768px) {
			.container {
				padding: 10px;
			}
			
			.header {
				padding: 20px;
			}
			
			.header h1 {
				font-size: 2em;
			}
			
			.message {
				padding: 15px;
			}
			
			.message-header {
				flex-direction: column;
				align-items: flex-start;
			}
			
			.avatar {
				margin-bottom: 10px;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>📝 Patch Notes</h1>
			<div class="subtitle">PokéChat - Mises à jour et améliorations</div>
		</div>
		
		<div class="update-date">
			<div class="date">🕐 Dernière mise à jour : ${new Date(exportDate).toLocaleString('fr-FR')}</div>
		</div>
		
		<div class="messages">
			${messages.map(message => generateMessageHtml(message)).join('')}
		</div>
	</div>
</body>
</html>`;

	return html;
}

/**
 * Génère le HTML pour un message individuel
 * @param {Object} message - Données du message
 * @returns {string} HTML du message
 */
function generateMessageHtml(message) {
	const authorInitial = message.author.displayName.charAt(0).toUpperCase();
	const messageDate = new Date(message.timestamp).toLocaleString('fr-FR');

	let attachmentsHtml = '';
	if (message.attachments.length > 0) {
		attachmentsHtml = `
			<div class="attachments">
				${message.attachments.map(att =>
			`<a href="${att.url}" class="attachment" target="_blank">📎 ${att.name}</a>`
		).join('')}
			</div>`;
	}

	let embedsHtml = '';
	if (message.embeds.length > 0) {
		embedsHtml = message.embeds.map(embed => {
			let fieldsHtml = '';
			if (embed.fields && embed.fields.length > 0) {
				fieldsHtml = `
					<div class="embed-fields">
						${embed.fields.map(field => `
							<div class="embed-field">
								<div class="embed-field-name">${field.name || 'Sans nom'}</div>
								<div class="embed-field-value">${field.value || 'Sans valeur'}</div>
							</div>
						`).join('')}
					</div>`;
			}

			return `
				<div class="embed">
					${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
					${embed.description ? `<div class="embed-description">${embed.description}</div>` : ''}
					${fieldsHtml}
				</div>`;
		}).join('');
	}

	return `
		<div class="message">
			<div class="message-header">
				<div class="avatar">${authorInitial}</div>
				<div class="author-info">
					<div class="author-name">${message.author.displayName}</div>
					<div class="message-time">${messageDate}</div>
				</div>
			</div>
			<div class="message-content">${message.content || ''}</div>
			${attachmentsHtml}
			${embedsHtml}
		</div>`;
}

// Fonction principale si le script est exécuté directement
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log('Usage: node exportToHtml.js <fichier_json> [fichier_html_sortie]');
		console.log('Exemple: node exportToHtml.js export_canal_1234567890.json');
		return;
	}

	const jsonFile = args[0];
	const htmlFile = args[1] || null;

	try {
		const outputPath = await convertExportToHtml(jsonFile, htmlFile);
		console.log(`🎉 Conversion terminée ! Fichier HTML créé : ${outputPath}`);
	} catch (error) {
		console.error('❌ Erreur lors de la conversion :', error);
		process.exit(1);
	}
}

// Exporter les fonctions pour utilisation dans d'autres modules
export { convertExportToHtml, generateHtml, generateMessageHtml };

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
