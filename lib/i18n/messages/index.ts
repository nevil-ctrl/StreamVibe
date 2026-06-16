import type { Locale } from '../config';
import type { Messages } from '../types';
import { en } from './en';
import { ru } from './ru';

const messages: Record<Locale, Messages> = { en, ru };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export type { Messages } from '../types';
