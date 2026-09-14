import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().min(9, "Namba ya simu si sahihi").max(15),
  password: z.string().min(4, "Neno la siri fupi mno"),
  name: z.string().min(2, "Jina fupi mno"),
  primaryCrop: z.string().min(2).default("Mahindi"),
  farmSizeAcres: z.number().positive().optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(9),
  password: z.string().min(1),
});

export const voiceTranscriptSchema = z.object({
  transcript: z.string().min(2, "Sauti haikueleweka. Tafadhali jaribu tena."),
});

export const clarifyAmountSchema = z.object({
  voiceRecordingId: z.string(),
  amount: z.number().positive(),
});

export const confirmTransactionSchema = z.object({
  voiceRecordingId: z.string().optional(),
  type: z.enum(["expense", "sale"]),
  category: z.string().min(1),
  activity: z.string().nullable().optional(),
  amount: z.number().positive(),
  crop: z.string().nullable().optional(),
  quantityLabel: z.string().nullable().optional(),
});

export const manualTransactionSchema = confirmTransactionSchema;

export const askSchema = z.object({
  question: z.string().min(2),
});

export const adminFarmerActionSchema = z.object({
  farmerId: z.string(),
  action: z.enum(["suspend", "activate", "delete"]),
});
