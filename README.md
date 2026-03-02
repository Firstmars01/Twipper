# Twipper

Clone simplifié de Twitter réalisé en React + Node.js.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Chakra UI v3, React Router v7 |
| **Backend** | Node.js, Express 4, TypeScript |
| **Base de données** | PostgreSQL |
| **ORM** | Prisma |
| **Authentification** | JWT (access token + refresh token), bcrypt |

## Architecture du projet

```
twipper/
├── client/          → Frontend React
│   └── src/
│       ├── pages/        → Home, Login, Register, Profile, Page404
│       ├── service/api/  → Appels HTTP (auth, user, follow, tweet)
│       ├── ui/           → Composants réutilisables (TopBar, Layout, FormField…)
│       └── utils/        → Toaster, validation
└── server/          → Backend Express
    ├── prisma/           → Schema + migrations
    └── src/
        ├── controllers/  → auth, user, follow, tweet
        ├── middleware/    → auth (JWT), error handler
        ├── routes/       → auth, user, follow, tweet
        └── lib/          → Client Prisma
```

## Modèle de données

- **User** : id, email, username, password, bio, avatar, flag
- **Tweet** : id, content (280 car. max), authorId, createdAt, updatedAt
- **Like** : id, userId, tweetId (unique par paire)
- **Follow** : id, followerId, followingId (unique par paire)

## Installation

### Prérequis

- Node.js
- PostgreSQL
- npm

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd twipper
```

### 2. Backend

```bash
cd server
npm install
```

Créer un fichier `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/twipper"
PORT=3001
```

Lancer les migrations et démarrer :

```bash
npx prisma migrate dev --name init
npm run dev
```

Le serveur démarre sur `http://localhost:3001`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`.

## Fonctionnalités

### Authentification
- Inscription (email, username, mot de passe)
- Connexion avec option "Se souvenir de moi"
- Refresh automatique du token JWT
- Déconnexion

### Tweets (CRUD complet)
- **Créer** un tweet (280 caractères max) depuis la page d'accueil
- **Lire** le fil d'actualité (ses tweets + ceux des personnes suivies)
- **Lire** les tweets d'un utilisateur sur son profil
- **Modifier** un tweet (édition inline, indication "modifié le …")
- **Supprimer** un tweet (suppression immédiate du fil et du profil)

### Profil utilisateur
- Affichage du profil (avatar, bio, stats)
- Liste des tweets de l'utilisateur
- Compteur de tweets, abonnés, abonnements

### Système de follow
- Suivre / Ne plus suivre un utilisateur
- Liste des abonnés et abonnements (dialog)

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/refresh` | Rafraîchir le token |
| `GET` | `/api/auth/me` | Utilisateur connecté |
| `GET` | `/api/users/:username` | Profil utilisateur |
| `POST` | `/api/tweets` | Créer un tweet |
| `GET` | `/api/tweets/feed` | Fil d'actualité |
| `GET` | `/api/tweets/user/:username` | Tweets d'un utilisateur |
| `PUT` | `/api/tweets/:id` | Modifier un tweet |
| `DELETE` | `/api/tweets/:id` | Supprimer un tweet |
| `POST` | `/api/users/:username/follow` | Suivre |
| `DELETE` | `/api/users/:username/follow` | Ne plus suivre |
| `GET` | `/api/users/:username/followers` | Liste des abonnés |
| `GET` | `/api/users/:username/following` | Liste des abonnements |

## Conventions

- **Code** : anglais
- **Git commit** : anglais
- **Commentaires** : français
- **Textes UI & erreurs** : français