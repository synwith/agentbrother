<p align="center">
  <img src="asset/logo2026.png" alt="AgentBrother Logo" width="400" height="400">
</p>

**[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md)**

# AgentBrother

Framework de gestion d'agents multiplateforme - Gestion unifiée d'OpenClaw, ZeroClaw et autres frameworks d'agents, permettant aux utilisateurs de créer des employés numériques IA et autres agents avec une approche WYSIWYG.

## Objectif du Projet

L'objectif principal d'AgentBrother est de fournir aux utilisateurs une interface unifiée et multiplateforme pour gérer et utiliser divers frameworks d'agents IA, tels qu'OpenClaw et ZeroClaw. Avec AgentBrother, les utilisateurs peuvent :

- Gérer plusieurs frameworks d'agents en un seul endroit, sans basculer entre différents outils
- Créer, configurer et utiliser des employés numériques IA avec une approche WYSIWYG
- Obtenir une expérience utilisateur cohérente sur différentes plateformes (Mac, Windows, Web, mobile)
- Simplifier le processus de création et de gestion des agents, réduisant la barrière à l'entrée

## Fonctionnalités

### Fonctionnalités Principales
- **Support multi-framework**: Intègre des frameworks d'agents populaires comme OpenClaw et ZeroClaw
- **Compatibilité multiplateforme**: Supporte Mac, Windows, Web et appareils mobiles
- **WYSIWYG**: Interface intuitive pour créer et configurer facilement des employés numériques IA
- **Gestion unifiée**: Gestion centralisée de tous les agents, y compris la surveillance de l'état et la configuration
- **Entrée flottante**: Supporte le raccourci global pour afficher la fenêtre d'entrée flottante pour une interaction rapide avec les agents
- **Glisser-déposer de fichiers**: Supporte le téléchargement par glisser-déposer de fichiers txt, doc, docx, pdf, analyse automatique du contenu et intégration dans les conversations
- **Démarrage automatique**: Détecte et démarre automatiquement OpenClaw Gateway après le lancement de l'application

### Fonctionnalités Techniques
- **Application de bureau Electron**: Fournit une expérience de bureau native
- **Interface Web**: Supporte l'accès via navigateur
- **TypeScript**: Base de code avec typage fort
- **Conception modulaire**: Facile à étendre et intégrer de nouveaux frameworks d'agents
- **Communication en temps réel**: Supporte l'interaction en temps réel avec les agents
- **Analyse locale de fichiers**: Analyse le contenu des fichiers localement, économisant la consommation de tokens

## Démarrage Rapide

### Exigences

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installer les Dépendances

```bash
npm install
```

### Exécuter en Mode Développement

#### Application de Bureau

```bash
npm run dev
```

#### Application Web

```bash
npm run start:web
```

### Construire l'Application

```bash
# Compiler TypeScript
npm run build

# Empaqueter l'application de bureau
npm run dist
```

## Structure du Projet

```
agentbrother/
├── docs/                   # Documentation
├── electron/               # Code du processus principal Electron
│   ├── main.js            # Entrée du processus principal
│   ├── preload.js         # Script de préchargement
│   └── renderer/          # Code du processus de rendu
│       ├── index.html     # Interface principale
│       ├── styles.css     # Fichiers de style
│       ├── main.js        # Logique principale du rendu
│       ├── framework.js   # Module de gestion des frameworks
│       ├── agents.js      # Module de gestion des agents
│       ├── floatInput.js  # Module d'entrée flottante
│       └── settings.js    # Module de paramètres
├── src/                    # Code principal
│   ├── core/              # Fonctionnalités principales
│   │   ├── bridges/       # Ponts de frameworks (OpenClaw, ZeroClaw)
│   │   └── types.ts       # Définitions de types
│   ├── web/               # Serveur Web
│   └── index.ts           # Point d'entrée principal
├── ui/                     # Interface utilisateur
│   └── float-input/       # Composant d'entrée flottante
├── dist/                   # Sortie de compilation TypeScript
├── package.json           # Configuration du projet
├── tsconfig.json          # Configuration TypeScript
└── README.md              # Documentation du projet
```

## Guide d'Utilisation

### Créer des Employés Numériques IA

1. Ouvrir l'application AgentBrother
2. Cliquer sur "Agents" dans la barre latérale gauche
3. Sélectionner un framework d'agents (OpenClaw ou ZeroClaw)
4. Cliquer sur le bouton "Créer un Nouvel Agent"
5. Remplir le nom de l'agent, sélectionner une icône, configurer les paramètres du modèle
6. Cliquer sur le bouton "Enregistrer" pour terminer la création

### Interagir avec les Agents

1. Cliquer sur "Entrée Flottante" dans la barre latérale gauche
2. Sélectionner l'agent avec lequel discuter
3. Taper un message dans la zone de saisie ou faire glisser des fichiers vers la zone de saisie
4. Cliquer sur le bouton d'envoi ou appuyer sur la touche Entrée
5. Attendre la réponse de l'agent

### Utiliser l'Entrée Flottante

1. Appuyer sur le raccourci global (par défaut `Cmd+Shift+A`)
2. Taper un message dans la fenêtre flottante
3. Appuyer sur la touche Entrée pour envoyer le message
4. Voir la réponse de l'agent

### Fonctionnalité de Glisser-Déposer de Fichiers

Supporte le glisser-déposer des formats de fichiers suivants vers la zone de chat :
- **.txt** - Fichiers texte brut, lecture directe du contenu
- **.doc/.docx** - Documents Word, utilise mammoth.js pour extraire le texte
- **.pdf** - Fichiers PDF, utilise pdf-parse pour extraire le texte

Limite de taille de fichier : 100KB

### Gestion de la Configuration

1. Cliquer sur "Configuration" dans la barre latérale gauche
2. Voir l'état des frameworks OpenClaw et ZeroClaw
3. Cliquer sur "Démarrer Gateway" pour démarrer manuellement OpenClaw Gateway
4. L'application détectera et démarrera automatiquement OpenClaw Gateway au démarrage (si installé)

## Plateformes Supportées

- **Mac** : Via l'application Electron (plateforme principale supportée)
- **Windows** : Via l'application Electron
- **Web** : Via l'accès navigateur
- **Appareils mobiles** : Via l'interface Web

## Configuration

### Configuration des Frameworks

AgentBrother détecte automatiquement les frameworks OpenClaw et ZeroClaw installés dans le système :

- **OpenClaw** : Détecte le chemin `~/Documents/trae_projects/openclaw_test/openclaw.sh`
- **ZeroClaw** : Détecte le chemin `~/Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw`

### Configuration de l'Entrée Flottante

Vous pouvez configurer l'entrée flottante dans les paramètres :
- État activer/désactiver
- Raccourci global (par défaut `Cmd+Shift+A`)
- Position (haut-gauche, haut-droite, bas-gauche, bas-droite, centre)
- Transparence
- Toujours au premier plan

### Variables d'Environnement

- `ARK_API_KEY` - Clé API Volcano Engine
- `OPENCLAW_CONFIG_PATH` - Chemin du fichier de configuration OpenClaw (optionnel)

## Extension

### Ajouter de Nouveaux Frameworks d'Agents

Pour ajouter un nouveau framework d'agents, vous devez :

1. Créer une nouvelle classe de pont dans le répertoire `src/core/bridges/`, héritant de `FrameworkBridge`
2. Implémenter toutes les méthodes abstraites (detect, connect, disconnect, getAgents, sendMessage, etc.)
3. Enregistrer la nouvelle classe de pont dans `src/index.ts`
4. Ajouter l'interface de configuration spécifique au framework dans `electron/renderer/agents.js`

### Types d'Agents Supportés

AgentBrother supporte plusieurs types d'agents :
- **chat** - Agent de type chat
- **code** - Agent de type code
- **image** - Agent de type image
- **video** - Agent de type vidéo
- **audio** - Agent de type audio
- **custom** - Agent de type personnalisé

## Guide de Développement

### Pile Technologique

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Bureau** : Electron 33+
- **Backend** : Node.js, Express
- **Types** : TypeScript 5+
- **Build** : electron-builder

### Dépendances d'Analyse de Fichiers

- **mammoth** (^1.11.0) - Analyser les fichiers .docx
- **pdf-parse** (^2.4.5) - Analyser les fichiers .pdf

### Notes de Développement

1. **Compilation TypeScript** : Après avoir modifié les fichiers dans le répertoire `src/`, exécutez `npm run build` pour compiler
2. **Processus principal Electron** : Après avoir modifié `electron/main.js`, redémarrez l'application
3. **Processus de rendu** : Après avoir modifié les fichiers dans `electron/renderer/`, actualisez la page
4. **Analyse de fichiers** : La fonctionnalité d'analyse de fichiers dépend de l'environnement Node.js, disponible uniquement dans Electron

## FAQ

### Q : "API Electron non prête" au démarrage
A : C'est un problème normal de séquence d'initialisation, l'application réessayera automatiquement après 1 seconde. Si cela persiste, vérifiez si Electron est correctement chargé.

### Q : OpenClaw Gateway ne peut pas démarrer automatiquement
A : Veuillez vérifier :
1. Si OpenClaw est installé dans le chemin par défaut
2. Si le script `openclaw.sh` a les permissions d'exécution
3. Si le port 18789 est occupé

### Q : La fonctionnalité de glisser-déposer de fichiers n'est pas disponible
A : La fonctionnalité de glisser-déposer de fichiers n'est disponible que dans l'application de bureau Electron, pas dans la version Web.

### Q : Erreurs de type lors de la compilation
A : Assurez-vous d'utiliser la version Node.js 20+ et exécutez `npm install` pour installer toutes les dépendances.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à contribuer du code, signaler des problèmes ou suggérer des améliorations !

### Soumettre des Problèmes

Veuillez décrire :
- Le phénomène du problème
- Les étapes pour reproduire
- Le comportement attendu
- Le comportement réel
- Les informations sur l'environnement (OS, version Node.js, etc.)

### Soumettre des PR

1. Forker ce dépôt
2. Créer une branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committer les modifications (`git commit -m 'Add amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Créer une Pull Request

## Licence

MIT License

## Journal des Modifications

### v1.0.0
- Version initiale
- Support des frameworks OpenClaw et ZeroClaw
- Implémentation de la fonctionnalité d'entrée flottante
- Support de l'analyse de fichiers par glisser-déposer (txt, doc, docx, pdf)
- Démarrage automatique d'OpenClaw Gateway
- Support multiplateforme (Mac, Windows, Web)
