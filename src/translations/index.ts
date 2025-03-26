// src/translations/index.ts
// Exportamos todas las traducciones desde un solo archivo

import { es } from './es';
import { en } from './en';

export const translations = {
  es,
  en
};

export type LanguageCode = keyof typeof translations; 