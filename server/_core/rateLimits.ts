import { rateLimit } from "express-rate-limit";

function createRateLimit(limit: number, windowMs: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Demasiadas tentativas. Aguarde antes de voltar a tentar.",
    },
  });
}

const minute = 60 * 1000;

export const authRateLimits = {
  googleStart: createRateLimit(10, 15 * minute),
  googleCallback: createRateLimit(15, 15 * minute),
  register: createRateLimit(5, 60 * minute),
  login: createRateLimit(10, 15 * minute),
  passwordResetRequest: createRateLimit(3, 60 * minute),
  passwordReset: createRateLimit(10, 15 * minute),
};

export const apiRateLimit = createRateLimit(300, 15 * minute);
