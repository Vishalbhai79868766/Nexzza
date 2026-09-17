import { z } from "zod";
export const games = ["Minecraft", "Valorant", "GTA V", "Co-op games", "Other"] as const;
export const platforms = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Multiple platforms"] as const;
export const applicationSchema = z.object({
  playerName: z.string().trim().min(2, "Use at least 2 characters for your player name.").max(32, "Keep your player name under 33 characters.").refine(value => !/[\u0000-\u001f\u007f]/.test(value), "Use a player name without control characters."),
  email: z.string().trim().max(254).email("Enter a valid email address.").transform(value => value.toLowerCase()),
  game: z.enum(games, { errorMap: () => ({ message: "Choose the game you play." }) }),
  platform: z.enum(platforms, { errorMap: () => ({ message: "Choose your gaming platform." }) }),
  message: z.string().trim().max(600, "Keep your introduction under 601 characters.").optional().default(""),
  website: z.string().max(200).optional().default(""),
}).strict();
