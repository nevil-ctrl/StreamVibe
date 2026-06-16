import type { en } from './messages/en';

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

export type Messages = DeepStringRecord<typeof en>;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

type NestedKeyOf<T, Prefix extends string = ''> = T extends string
  ? Prefix extends ''
    ? never
    : Prefix
  : {
      [K in keyof T & string]: T[K] extends string
        ? Prefix extends ''
          ? K
          : Join<Prefix, K>
        : NestedKeyOf<T[K], Prefix extends '' ? K : Join<Prefix, K>>;
    }[keyof T & string];

export type MessageKey = NestedKeyOf<Messages>;
