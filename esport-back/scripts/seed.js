/**
 * Peuple la base avec des données de démo (équipes, joueurs, coachs, tournois, matchs).
 * Usage : node scripts/seed.js
 * Nécessite MONGODB_URI dans l'environnement (ou un fichier .env chargé par dotenv).
 * Refuse de tourner si des équipes existent déjà, sauf avec --force.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Team = require('../src/models/Team');
const Player = require('../src/models/Player');
const Coach = require('../src/models/Coach');
const Tournament = require('../src/models/Tournament');
const Match = require('../src/models/Match');
const Standing = require('../src/models/Standing');

const FORCE = process.argv.includes('--force');

const TEAMS = [
  { name: 'Neon Wolves', tag: 'NEON', country: 'FR', foundedYear: 2018 },
  { name: 'Crimson Phoenix', tag: 'CRMS', country: 'DE', foundedYear: 2016 },
  { name: 'Iron Sentinels', tag: 'IRON', country: 'SE', foundedYear: 2019 },
  { name: 'Void Reapers', tag: 'VOID', country: 'PL', foundedYear: 2020 },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connecté à MongoDB.');

  const existing = await Team.countDocuments();
  if (existing > 0 && !FORCE) {
    console.log(`${existing} équipe(s) déjà en base — utilise --force pour réinitialiser.`);
    await mongoose.disconnect();
    return;
  }

  if (FORCE) {
    await Promise.all([
      Team.deleteMany({}), Player.deleteMany({}), Coach.deleteMany({}),
      Tournament.deleteMany({}), Match.deleteMany({}), Standing.deleteMany({}),
    ]);
    console.log('Collections vidées (--force).');
  }

  const teams = await Team.insertMany(TEAMS);
  console.log(`${teams.length} équipes créées.`);

  const players = await Player.insertMany(teams.flatMap((team, i) => ([
    { teamId: team._id, nickname: `${team.tag}_ace${i}`, realName: 'Joueur Un', nationality: team.country, birthDate: new Date('2001-05-12') },
    { teamId: team._id, nickname: `${team.tag}_support${i}`, realName: 'Joueur Deux', nationality: team.country, birthDate: new Date('2000-09-03') },
  ])));
  console.log(`${players.length} joueurs créés.`);

  const coaches = await Coach.insertMany(teams.map((team) => ({
    teamId: team._id, name: `Coach ${team.tag}`, nationality: team.country, experience: 4,
  })));
  console.log(`${coaches.length} coachs créés.`);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const [t1, t2] = await Tournament.insertMany([
    {
      name: 'Winter Championship 2026', game: 'Valorant', prizePool: 500000,
      startDate: new Date(now - 5 * day), endDate: new Date(now + 10 * day),
      location: 'Paris, France', status: 'ongoing',
    },
    {
      name: 'Spring Invitational 2026', game: 'CS:GO', prizePool: 150000,
      startDate: new Date(now + 20 * day), endDate: new Date(now + 25 * day),
      location: 'Berlin, Allemagne', status: 'upcoming',
    },
  ]);
  console.log('2 tournois créés.');

  const [neon, crimson, iron, void_] = teams;

  const matches = await Match.insertMany([
    { tournamentId: t1._id, team1Id: neon._id, team2Id: crimson._id, scheduledAt: new Date(now + 2 * 3600 * 1000), status: 'live', scoreTeam1: 1, scoreTeam2: 0, bestOf: 3 },
    { tournamentId: t1._id, team1Id: iron._id, team2Id: void_._id, scheduledAt: new Date(now + day), status: 'scheduled', bestOf: 3 },
    { tournamentId: t1._id, team1Id: neon._id, team2Id: iron._id, scheduledAt: new Date(now - 2 * day), status: 'completed', scoreTeam1: 2, scoreTeam2: 1, winnerId: neon._id, bestOf: 3 },
    { tournamentId: t2._id, team1Id: crimson._id, team2Id: void_._id, scheduledAt: new Date(now + 21 * day), status: 'scheduled', bestOf: 1 },
  ]);
  console.log(`${matches.length} matchs créés.`);

  const standings = await Standing.insertMany(teams.map((team, i) => ({
    tournamentId: t1._id, teamId: team._id,
    matchesPlayed: 2, wins: 2 - i % 2, losses: i % 2, draws: 0,
    points: (2 - i % 2) * 3, goalsFor: 4 - i, goalsAgainst: i,
  })));
  console.log(`${standings.length} classements créés.`);

  await mongoose.disconnect();
  console.log('Terminé.');
}

run().catch((err) => {
  console.error('Erreur de seed :', err);
  process.exit(1);
});
