"use server";

import { revalidatePath } from "next/cache";
import {
  createCategoryInPocketBase,
  createGroupInPocketBase,
  createTournamentInPocketBase,
  assignPairToGroupInPocketBase,
  registerPairInPocketBase,
  updateTournamentDetailsInPocketBase,
  updateTournamentStatusInPocketBase,
} from "@/lib/pocketbase";
import type { RegistrationStatus, ScoreFormat, TournamentStatus } from "@/lib/tournament";

const tournamentStatuses = [
  "draft",
  "registration-open",
  "registration-closed",
  "in-progress",
  "completed",
  "cancelled",
] as const satisfies TournamentStatus[];

const scoreFormats = ["best-of-three", "super-tiebreak", "single-set"] as const satisfies ScoreFormat[];
const registrationStatuses = [
  "pending",
  "confirmed",
  "waitlisted",
  "withdrawn",
  "disqualified",
] as const satisfies RegistrationStatus[];

export async function createTournamentAction(formData: FormData) {
  const name = requiredString(formData, "name");
  const clubName = requiredString(formData, "clubName");
  const venue = requiredString(formData, "venue");
  const dateRange = requiredString(formData, "dateRange");
  const categoryName = requiredString(formData, "categoryName");
  const categoryCapacity = positiveInteger(formData, "categoryCapacity");
  const qualifierSlotsPerGroup = positiveInteger(formData, "qualifierSlotsPerGroup");
  const playoffSize = parsePlayoffSize(formData.get("playoffSize"));
  const scoreFormat = parseEnum(formData.get("scoreFormat"), scoreFormats, "scoreFormat");

  await createTournamentInPocketBase({
    name,
    clubName,
    venue,
    dateRange,
    categoryName,
    categoryCapacity,
    playoffSize,
    scoreFormat,
    qualifierSlotsPerGroup,
  });

  refreshTournamentViews();
}

export async function updateTournamentDetailsAction(formData: FormData) {
  const id = requiredString(formData, "id");

  await updateTournamentDetailsInPocketBase({
    id,
    name: requiredString(formData, "name"),
    clubName: requiredString(formData, "clubName"),
    venue: requiredString(formData, "venue"),
    dateRange: requiredString(formData, "dateRange"),
    published: formData.get("published") === "on",
  });

  refreshTournamentViews();
}

export async function updateTournamentStatusAction(formData: FormData) {
  const id = requiredString(formData, "id");
  const status = parseEnum(formData.get("status"), tournamentStatuses, "status");

  await updateTournamentStatusInPocketBase(id, status);
  refreshTournamentViews();
}

export async function registerPairAction(formData: FormData) {
  const categoryId = requiredString(formData, "categoryId");
  const playerOneName = requiredString(formData, "playerOneName");
  const playerTwoName = requiredString(formData, "playerTwoName");

  if (playerOneName.toLocaleLowerCase("es") === playerTwoName.toLocaleLowerCase("es")) {
    throw new Error("La pareja debe tener dos jugadores distintos.");
  }

  await registerPairInPocketBase({
    categoryId,
    playerOneName,
    playerTwoName,
    requestedStatus: parseEnum(formData.get("status"), registrationStatuses, "status"),
  });

  refreshTournamentViews();
}

export async function createCategoryAction(formData: FormData) {
  await createCategoryInPocketBase({
    tournamentId: requiredString(formData, "tournamentId"),
    name: requiredString(formData, "name"),
    capacity: positiveInteger(formData, "capacity"),
    playoffSize: parsePlayoffSize(formData.get("playoffSize")),
    scoreFormat: parseEnum(formData.get("scoreFormat"), scoreFormats, "scoreFormat"),
    qualifierSlotsPerGroup: positiveInteger(formData, "qualifierSlotsPerGroup"),
  });

  refreshTournamentViews();
}

export async function createGroupAction(formData: FormData) {
  await createGroupInPocketBase({
    categoryId: requiredString(formData, "categoryId"),
    name: requiredString(formData, "name"),
    displayOrder: positiveInteger(formData, "displayOrder"),
  });

  refreshTournamentViews();
}

export async function assignPairToGroupAction(formData: FormData) {
  await assignPairToGroupInPocketBase({
    categoryId: requiredString(formData, "categoryId"),
    groupId: requiredString(formData, "groupId"),
    pairId: requiredString(formData, "pairId"),
  });

  refreshTournamentViews();
}

function refreshTournamentViews() {
  revalidatePath("/");
  revalidatePath("/publico/torneo-demo");
}

function requiredString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`El campo ${name} es obligatorio.`);
  }

  return value.trim();
}

function positiveInteger(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`El campo ${name} debe ser un numero entero positivo.`);
  }

  return value;
}

function parsePlayoffSize(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (parsed === 4 || parsed === 8 || parsed === 16) return parsed;

  throw new Error("El tamano de playoff debe ser 4, 8 o 16.");
}

function parseEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[],
  fieldName: string,
): T {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }

  throw new Error(`Valor invalido para ${fieldName}.`);
}
