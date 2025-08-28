# 📝 Export de l'historique des canaux Discord

Cette fonctionnalité permet d'exporter l'historique complet d'un canal Discord pour créer une page web de patch notes professionnelle.

## 🚀 Utilisation

### 1. Export via Discord

Utilisez la commande `!export` dans le canal que vous souhaitez exporter :
- **Commande** : `!export`
- **Permissions** : Utilisateur autorisé uniquement (ID configuré)
- **Fonctionnement** : Exporte tous les messages du canal depuis sa création
- **Fichier** : Crée/écrase `exports/patchnotes.json`

### 2. Conversion en HTML

Après l'export, utilisez le script `exportToHtml.js` pour convertir le JSON en HTML :

```bash
# Conversion automatique (utilise le fichier patchnotes.json)
node generatePatchnotes.js

# Conversion manuelle avec fichier personnalisé
node exportToHtml.js exports/patchnotes.json mon_site.html
```

## 📁 Structure des fichiers

### Fichiers d'export
- **Emplacement** : `./exports/`
- **Format** : `patchnotes.json` (nom fixe, écrase l'ancien)
- **Contenu** : Tous les messages avec métadonnées complètes

### Fichiers HTML générés
- **Format** : HTML responsive et moderne
- **Style** : Design patch notes professionnel avec thème Discord sombre
- **Fonctionnalités** : Interface épurée, support mobile, formatage Markdown

## 🔧 Fonctionnalités de l'export

### Données exportées
- ✅ **Messages** : Contenu textuel complet avec formatage Markdown
- ✅ **Auteurs** : Nom d'utilisateur et nom d'affichage
- ✅ **Horodatage** : Date et heure exactes
- ✅ **Pièces jointes** : Liens et métadonnées
- ✅ **Embeds** : Titres, descriptions, champs
- ✅ **Présentation** : Interface patch notes professionnelle

### Limites Discord
- **Rate limiting** : Pause de 100ms entre chaque lot
- **Taille des lots** : 100 messages par requête
- **Ordre chronologique** : Du plus ancien au plus récent

## 🎨 Personnalisation du HTML

### Styles CSS
- **Thème** : Discord sombre professionnel (#36393f)
- **Responsive** : Adaptatif mobile/desktop
- **Animations** : Hover effects et transitions fluides

### Sections incluses
- **En-tête** : Titre "Patch Notes" avec sous-titre
- **Date de mise à jour** : Horodatage de l'export
- **Messages** : Affichage chronologique avec formatage Markdown
- **Pièces jointes** : Liens cliquables
- **Embeds** : Formatage Discord-like

## 📱 Utilisation sur site web

### Hébergement
1. **Local** : Ouvrir le fichier HTML dans un navigateur
2. **Serveur web** : Upload sur votre hébergeur
3. **GitHub Pages** : Déployer depuis un repository

### Intégration
- **CSS personnalisé** : Modifier les styles dans le script
- **JavaScript** : Ajouter des fonctionnalités interactives
- **Base de données** : Importer les données JSON

## ⚠️ Notes importantes

### Performance
- **Grands canaux** : L'export peut prendre plusieurs minutes
- **Mémoire** : Les très gros canaux peuvent nécessiter plus de RAM
- **API Discord** : Respect des limites de rate limiting

### Sécurité
- **Permissions** : Commande réservée aux administrateurs
- **Données sensibles** : Vérifiez le contenu avant publication
- **Vie privée** : Respectez les droits des utilisateurs

### Maintenance
- **Mise à jour** : Re-exporter périodiquement pour les nouveaux messages
- **Archivage** : Sauvegardez les exports importants
- **Versioning** : Gardez une trace des différentes versions

## 🛠️ Dépannage

### Erreurs communes
- **Permission denied** : Vérifiez les droits administrateur
- **Rate limit** : Attendez et réessayez
- **Canal non trouvé** : Vérifiez l'ID du canal

### Logs
- **Console Discord** : Messages de progression
- **Fichiers d'export** : Vérifiez la taille et le contenu
- **Erreurs** : Messages d'erreur détaillés

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Testez avec un petit canal d'abord
3. Vérifiez les permissions Discord
4. Consultez la documentation Discord.js

---

**Note** : Cette fonctionnalité est conçue pour un usage responsable et respectueux des droits des utilisateurs et des conditions d'utilisation de Discord.
