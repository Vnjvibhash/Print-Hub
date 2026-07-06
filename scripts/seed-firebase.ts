import fs from "node:fs";
import path from "node:path";

async function main() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      process.env[key] = rest.join("=");
    }
  }

  const { dbService, isFirebaseEnabled } = await import("../src/lib/firebase");

  console.log("Firebase enabled:", isFirebaseEnabled);

  if (!isFirebaseEnabled) {
    console.error("Firebase is not enabled. Check your environment variables.");
    process.exit(1);
  }

  await dbService.seedDefaultData();
  console.log("Firebase seed completed successfully.");
}

main().catch((error) => {
  console.error("Firebase seed failed.", error);
  process.exit(1);
});
