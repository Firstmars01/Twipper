import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERS = [
  { username: "alice",    email: "alice@test.com",    bio: "Développeuse passionnée 🚀" },
  { username: "bob",      email: "bob@test.com",      bio: "Fan de cinéma et de séries 🎬" },
  { username: "charlie",  email: "charlie@test.com",  bio: "Amateur de café et de code ☕" },
  { username: "diana",    email: "diana@test.com",     bio: "Designer UI/UX 🎨" },
  { username: "eve",      email: "eve@test.com",       bio: "Cybersécurité & vie privée 🔒" },
  { username: "frank",    email: "frank@test.com",     bio: "Gamer et streamer 🎮" },
  { username: "grace",    email: "grace@test.com",     bio: "Data scientist en herbe 📊" },
  { username: "hugo",     email: "hugo@test.com",      bio: "Étudiant en informatique 💻" },
  { username: "iris",     email: "iris@test.com",      bio: "Passionnée de musique 🎵" },
  { username: "julien",   email: "julien@test.com",    bio: "Full-stack dev & pizza lover 🍕" },
];

const TWEETS = [
  "Bonjour le monde ! Premier tweet sur Twipper 🐦",
  "Quelqu'un a des recommandations de podcasts tech ?",
  "Le TypeScript c'est la vie, change my mind.",
  "Je viens de finir un projet React, trop content du résultat !",
  "Café + code = combo parfait ☕💻",
  "Il fait beau aujourd'hui, parfait pour coder en terrasse",
  "Qui est chaud pour un hackathon ce week-end ?",
  "Je découvre Prisma et c'est vraiment cool pour la gestion de BDD",
  "Petit rappel : faites vos commits régulièrement 😅",
  "Les dark modes c'est non-négociable ✨",
  "Node.js ou Deno ? Le débat continue...",
  "J'adore la communauté dev, toujours prête à aider 🙌",
  "Astuce du jour : utilisez des alias d'import, ça change la vie",
  "Mon setup : VS Code + Copilot + un bon casque 🎧",
  "REST vs GraphQL, vous êtes team quoi ?",
  "Vite.js pour le front, Express pour le back, combo gagnant 🔥",
  "Premier déploiement en prod sans bug, c'est possible ? 🤔",
  "Design system > pas de design system",
  "Les tests unitaires, c'est comme le sport : on sait qu'il faut en faire",
  "Bonne nuit la TL, demain on recommence 🌙",
  "Hot take : les tabs > les spaces",
  "Qui utilise encore jQuery en 2026 ? (pas de jugement)",
  "TIL : on peut faire des trucs incroyables avec CSS Grid",
  "La meilleure feature de ES2026 ? Les pattern matching !",
  "Je cherche des gens à follow, des recommandations ?",
  "Retour d'expérience : migrer de JS à TS, meilleure décision ever",
  "Les code reviews c'est un art, pas une corvée",
  "PostgreSQL + Prisma = ❤️",
  "Objectif de la semaine : contribuer à un projet open source",
  "Rien de tel qu'un bon refacto pour se sentir bien",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

async function main() {
  console.log("🌱 Seeding database...\n");

  const password = await bcrypt.hash("test1234", 10);

  // Créer les utilisateurs
  const createdUsers = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        password,
        bio: u.bio,
      },
    });
    createdUsers.push(user);
    console.log(`User: @${user.username} (${user.email})`);
  }

  // Créer des tweets (3-5 par user)
  const allTweets = [];
  for (const user of createdUsers) {
    const count = 3 + Math.floor(Math.random() * 3); // 3 à 5 tweets
    for (let i = 0; i < count; i++) {
      const createdAt = randomDate(14); // dans les 14 derniers jours
      const tweet = await prisma.tweet.create({
        data: {
          content: randomItem(TWEETS),
          authorId: user.id,
          createdAt,
          updatedAt: createdAt,
        },
      });
      allTweets.push(tweet);
    }
    console.log(`${count} tweets pour @${user.username}`);
  }

  // Créer des likes aléatoires
  let likeCount = 0;
  for (const user of createdUsers) {
    const tweetsToLike = allTweets
      .filter((t) => t.authorId !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5 + Math.floor(Math.random() * 10));

    for (const tweet of tweetsToLike) {
      await prisma.like.upsert({
        where: { userId_tweetId: { userId: user.id, tweetId: tweet.id } },
        update: {},
        create: { userId: user.id, tweetId: tweet.id },
      });
      likeCount++;
    }
  }
  console.log(`${likeCount} likes créés`);

  // Créer des follows aléatoires (chaque user follow 2-5 autres)
  let followCount = 0;
  for (const user of createdUsers) {
    const toFollow = createdUsers
      .filter((u) => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 4));

    for (const target of toFollow) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
        update: {},
        create: { followerId: user.id, followingId: target.id },
      });
      followCount++;
    }
  }
  console.log(`  👥 ${followCount} follows créés`);

  // Quelques retweets
  let retweetCount = 0;
  for (const user of createdUsers.slice(0, 5)) {
    const toRetweet = allTweets
      .filter((t) => t.authorId !== user.id && !t.retweetOfId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1 + Math.floor(Math.random() * 2));

    for (const tweet of toRetweet) {
      const createdAt = randomDate(3);
      await prisma.tweet.create({
        data: {
          content: tweet.content,
          authorId: user.id,
          retweetOfId: tweet.id,
          createdAt,
          updatedAt: createdAt,
        },
      });
      retweetCount++;
    }
  }
  console.log(`${retweetCount} retweets créés`);

  console.log("\n✨ Seed terminé !");
  console.log("   Mot de passe pour tous les comptes : test1234");
}

main()
  .catch((e) => {
    console.error("Erreur seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
