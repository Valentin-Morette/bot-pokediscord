#!/bin/bash

# Script de déploiement pour le bot Discord
# Usage: ./deploy.sh user@vps-ip /path/on/vps

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier les arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}Usage: ./deploy.sh user@vps-ip /path/on/vps${NC}"
    echo "Exemple: ./deploy.sh ubuntu@192.168.1.100 /home/ubuntu/bot-pokediscord"
    exit 1
fi

VPS_HOST=$1
VPS_PATH=$2
LOCAL_PATH="."

echo -e "${GREEN}🚀 Déploiement du bot Discord sur ${VPS_HOST}${NC}"
echo ""

# Vérifier que rsync est installé
if ! command -v rsync &> /dev/null; then
    echo -e "${RED}❌ rsync n'est pas installé. Installez-le avec: brew install rsync${NC}"
    exit 1
fi

# Vérifier que le fichier .env existe localement (pour rappel)
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Attention: Le fichier .env n'existe pas localement${NC}"
    echo "Assurez-vous de créer le fichier .env sur le VPS après le déploiement"
fi

echo -e "${GREEN}📦 Synchronisation des fichiers...${NC}"
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='.env' \
    "${LOCAL_PATH}/" "${VPS_HOST}:${VPS_PATH}/"

echo ""
echo -e "${GREEN}✅ Fichiers synchronisés avec succès!${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes sur le VPS:${NC}"
echo "1. cd ${VPS_PATH}"
echo "2. Créer le fichier .env avec vos variables d'environnement"
echo "3. npm install"
echo "4. npm start (pour tester)"
echo "5. pm2 start index.js --name bot-pokediscord (pour la production)"
echo ""
echo -e "${GREEN}✨ Déploiement terminé!${NC}"
