import type { Messages, MessageKey } from './types';

type Params = Record<string, string | number>;

function getNestedValue(obj: Messages, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function createTranslator(messages: Messages) {
  return function t(key: MessageKey, params?: Params): string {
    const template = getNestedValue(messages, key);
    if (!template) return key;

    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (_, name: string) => {
      const value = params[name];
      return value !== undefined ? String(value) : `{${name}}`;
    });
  };
}

export type Translator = ReturnType<typeof createTranslator>;
