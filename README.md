# Frigo App - Gestionnaire de Réfrigérateur Intelligent

![Logo de l'application](https://raw.githubusercontent.com/user-attachments/assets/a8a3a731-521d-438a-9281-329ac52f8939)

Frigo App est une application mobile conçue pour vous aider à gérer facilement le contenu de votre réfrigérateur. Scannez des produits, suivez les dates de péremption et gardez un œil sur votre inventaire pour réduire le gaspillage alimentaire.

## ✨ Fonctionnalités

- **Inventaire du frigo** : Visualisez rapidement les articles présents dans votre frigo, triés par quantité.
- **Gestion des articles** : Une liste complète de tous vos produits, avec la possibilité de rechercher et de modifier les quantités.
- **Ajout par Scan** : Utilisez l'appareil photo de votre téléphone pour scanner le code-barres d'un produit.
- **Pré-remplissage automatique** : Grâce à l'intégration avec l'API [Open Food Facts](https://openfoodfacts.org), le nom, la quantité et l'image du produit sont automatiquement récupérés après le scan.
- **Modification manuelle** : Ajustez facilement la quantité ou la date de péremption (format `YYYY-MM-DD`) directement dans la liste.
- **Interface simple et intuitive** : Une expérience utilisateur épurée pour une gestion rapide et efficace.

## 🛠️ Technologies utilisées

- **Framework** : [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Routing** : [Expo Router](https://docs.expo.dev/router/introduction/) (navigation basée sur les fichiers)
- **API externe** : [Open Food Facts](https://openfoodfacts.org) pour les données produits

## 🚀 Démarrage rapide

Suivez ces étapes pour lancer le projet sur votre machine locale.

### Prérequis

- [Node.js](https://nodejs.org/) (version LTS recommandée)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- L'application **Expo Go** installée sur votre téléphone (iOS ou Android)

### Installation

1.  **Clonez le dépôt**
    ```bash
    git clone https://github.com/VOTRE_NOM/react-native-expo-frigo.git
    cd react-native-expo-frigo
    ```

2.  **Installez les dépendances**
    ```bash
    npm install
    ```

### Lancement de l'application

1.  **Démarrez le serveur de développement Expo**
    ```bash
    npm start
    ```
    Cette commande lancera le serveur Metro et affichera un QR code dans votre terminal.

2.  **Lancez l'application sur votre téléphone**
    - Ouvrez l'application **Expo Go** sur votre appareil Android ou iOS.
    - Scannez le QR code affiché dans le terminal.

L'application se chargera et vous pourrez commencer à l'utiliser.

## 📜 Commandes disponibles

- `npm start` : Démarre le serveur de développement Metro.
- `npm run android` : Lance l'application sur un émulateur Android (si configuré).
- `npm run ios` : Lance l'application sur un simulateur iOS (macOS uniquement).
- `npm run web` : Lance l'application dans un navigateur web.
- `npm run lint` : Exécute l'outil de linting pour vérifier la qualité du code.

## 📂 Structure du projet

```
/
├── app/                # Écrans et navigation de l'application (Expo Router)
│   ├── (tabs)/         # Layout des onglets et écrans principaux
│   └── _layout.tsx     # Layout principal de l'application
├── assets/             # Polices et images statiques
├── components/         # Composants React réutilisables
├── constants/          # Constantes (couleurs, etc.)
├── hooks/              # Hooks React personnalisés
├── node_modules/       # Dépendances du projet
├── .gitignore          # Fichiers ignorés par Git
├── app.json            # Configuration de l'application Expo
├── package.json        # Dépendances et scripts npm
└── tsconfig.json       # Configuration TypeScript
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Si vous souhaitez améliorer l'application, n'hésitez pas à forker le projet et à ouvrir une Pull Request.

1.  Forkez le projet
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`)
3.  Commitez vos changements (`git commit -m 'Ajout de NouvelleFonctionnalite'`)
4.  Pushez vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5.  Ouvrez une Pull Request

## 📄 Licence

Ce projet est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.