/**
 * Tests de sécurité transverses : injection NoSQL
 */

const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

require('../app');

describe('Injection NoSQL', () => {
  it('sanitizeFilter est activé globalement au démarrage de l\'app', () => {
    expect(mongoose.get('sanitizeFilter')).toBe(true);
  });

  it('un opérateur $ne envoyé par le client est neutralisé en valeur littérale', () => {
    const filtre = mongoose.sanitizeFilter({ email: { $ne: null } });
    expect(filtre).toEqual({ email: { $eq: { $ne: null } } });
  });

  it('un filtre légitime n\'est pas modifié', () => {
    const filtre = mongoose.sanitizeFilter({ email: 'joueur@test.fr' });
    expect(filtre).toEqual({ email: 'joueur@test.fr' });
  });
});
