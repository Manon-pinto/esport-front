/**
 * Erreur métier attendue (ex: solde insuffisant, ressource introuvable).
 * Portée par la couche service, traduite en réponse HTTP par le contrôleur —
 * c'est ce qui permet au service de ne rien connaître d'Express/res.json.
 */
class AppError extends Error {
  constructor(statusCode, error, details) {
    super(error);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

module.exports = AppError;
