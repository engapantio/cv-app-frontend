import { en } from "@/messages/en";
import { ru } from "@/messages/ru";
import { pl } from "@/messages/pl";
import { de } from "@/messages/de";
import type { Messages } from "@/messages/en";
import { locales } from "@/i18n/locales";

export const messages: Record<(typeof locales)[number]["code"], Messages> = {
  en,
  ru,
  pl,
  de,
};
