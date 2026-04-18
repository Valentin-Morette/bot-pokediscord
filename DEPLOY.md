# Guide de déploiement sur VPS

## Fichiers à déployer sur le VPS

### ✅ Fichiers essentiels à copier :

```
bot-pokediscord/
├── assets/                    # ✅ Tous les assets (images, emojis)
│   ├── arenaTrainer/
│   └── emojis/
├── *.js                        # ✅ Tous les fichiers JavaScript
│   ├── index.js
│   ├── pokechat.js
│   ├── pokemonFunctions.js
│   ├── trainerFunctions.js
│   ├── createServerFunctions.js
│   ├── globalFunctions.js
│   ├── listEmbed.js
│   ├── varClients.js
│   └── variables.js
├── package.json                # ✅ Dépendances
├── package-lock.json          # ✅ Version exacte des dépendances
└── .env                        # ⚠️ À créer sur le VPS (voir ci-dessous)
```

### ❌ Fichiers à NE PAS copier :

- `node_modules/` - Sera installé sur le VPS avec `npm install`
- `.git/` - Pas nécessaire en production
- `.DS_Store` - Fichiers macOS
- `README.md` - Documentation (optionnel)
- `new-gen.txt` - Fichier de test (optionnel)

## Étapes de déploiement

### 1. Préparer les fichiers sur votre machine locale

```bash
# Créer un dossier de déploiement (sans node_modules et .git)
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.DS_Store' \
  /Users/vmorette/Documents/Developpement/bot-pokediscord/ \
  bot-pokediscord-deploy/
```

### 2. Transférer les fichiers sur le VPS

```bash
# Depuis votre machine locale
scp -r bot-pokediscord-deploy/* user@votre-vps:/home/ubuntu/bot-pokediscord/
```

Ou avec rsync (recommandé) :
```bash
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.DS_Store' \
  /Users/vmorette/Documents/Developpement/bot-pokediscord/ \
  user@votre-vps:/home/ubuntu/bot-pokediscord/
```

### 3. Sur le VPS : Configuration

```bash
# Se connecter au VPS
ssh user@votre-vps

# Aller dans le dossier du bot
cd /home/ubuntu/bot-pokediscord

# Créer le fichier .env avec vos variables d'environnement
nano .env
```

Contenu du fichier `.env` :
```env
TOKEN=votre_token_discord
IDAPPLICATION=votre_id_application
IDSERVER=votre_id_serveur
MYDISCORDID=votre_id_discord
VITE_BACKEND_URL=https://votre-backend-url.com
API_KEY=votre_api_key
```

### 4. Installer les dépendances

```bash
# Installer Node.js si pas déjà installé (version 18+ recommandée)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer les dépendances du bot
npm install
```

### 5. Tester le bot

```bash
# Tester une première fois
npm start
```

Si tout fonctionne, arrêter avec `Ctrl+C`.

### 6. Installer PM2 (gestionnaire de processus)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer le bot avec PM2
pm2 start index.js --name bot-pokediscord

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

### 7. Commandes PM2 utiles

```bash
# Voir les logs
pm2 logs bot-pokediscord

# Voir le statut
pm2 status

# Redémarrer le bot
pm2 restart bot-pokediscord

# Arrêter le bot
pm2 stop bot-pokediscord

# Voir les logs en temps réel
pm2 logs bot-pokediscord --lines 50
```

## Mise à jour du bot

Pour mettre à jour le bot après des modifications :

```bash
# Sur votre machine locale, transférer les nouveaux fichiers
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.DS_Store' \
  /Users/vmorette/Documents/Developpement/bot-pokediscord/ \
  user@votre-vps:/home/ubuntu/bot-pokediscord/

# Sur le VPS
cd /home/ubuntu/bot-pokediscord
npm install  # Si de nouvelles dépendances ont été ajoutées
pm2 restart bot-pokediscord
```

## Vérification

Vérifiez que le bot fonctionne :
- Les logs PM2 ne montrent pas d'erreurs
- Le bot répond aux commandes sur Discord
- Les logs montrent "Pokechat Ready!"
