const AppError = require('./AppError');

/**
 * Traduit une erreur venue d'un service (AppError, erreur de validation
 * Mongoose, ou erreur inattendue) en réponse HTTP. Partagé par les
 * contrôleurs pour éviter de dupliquer ce mapping dans chacun.
 */
function handleError(res, error, context) {
  console.error(`Erreur ${context}:`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.error, ...(error.details || {}) });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Erreur de validation', details: messages });
  }

  res.status(500).json({ error: error.message });
}

module.exports = handleError;
