import "dotenv/config";
import {
  authSessions,
  orders,
  passwordResetTokens,
  processedStripeEvents,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";

async function checkDatabase() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL não está configurado");
  }

  const database = await getDb();
  if (!database)
    throw new Error("Não foi possível inicializar a ligação MySQL");

  try {
    await database.select({ id: users.id }).from(users).limit(1);
    await database.select({ id: authSessions.id }).from(authSessions).limit(1);
    await database
      .select({ id: passwordResetTokens.id })
      .from(passwordResetTokens)
      .limit(1);
    await database.select({ id: orders.id }).from(orders).limit(1);
    await database
      .select({ id: processedStripeEvents.id })
      .from(processedStripeEvents)
      .limit(1);
    console.log("MySQL e tabelas de conta/pagamento: disponíveis");
  } finally {
    await database.$client.end();
  }
}

checkDatabase().catch(error => {
  console.error(
    "Verificação da base de dados falhou:",
    error instanceof Error ? error.message : "erro desconhecido"
  );
  process.exitCode = 1;
});
