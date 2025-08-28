import { convertExportToHtml } from './exportToHtml.js';

async function generatePatchnotes() {
    try {
        console.log('🔄 Génération des patch notes...');

        // Convertir le fichier patchnotes.json en HTML
        await convertExportToHtml('./exports/patchnotes.json', './patchnotes.html');

        console.log('✅ Patch notes générées avec succès !');
        console.log('📁 Fichier créé : patchnotes.html');
        console.log('🌐 Ouvrez le fichier dans votre navigateur pour le prévisualiser');

    } catch (error) {
        console.error('❌ Erreur lors de la génération des patch notes :', error.message);

        if (error.code === 'ENOENT') {
            console.log('💡 Conseil : Utilisez d\'abord la commande !export dans Discord pour créer le fichier patchnotes.json');
        }
    }
}

// Exécuter le script
generatePatchnotes();
