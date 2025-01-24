/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react';
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types';

  export type { RegisterSWOptions };

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare module 'fzy.js' {
  export const SCORE_MIN: number;
  export const SCORE_MAX: number;
  export const SCORE_GAP_LEADING: number;
  export const SCORE_GAP_TRAILING: number;
  export const SCORE_GAP_INNER: number;
  export const SCORE_MATCH_CONSECUTIVE: number;
  export const SCORE_MATCH_SLASH: number;
  export const SCORE_MATCH_WORD: number;
  export const SCORE_MATCH_CAPITAL: number;
  export const SCORE_MATCH_DOT: number;

  export function score(query: string, choice: string): number;
  export function positions(query: string, choice: string): number[];
  export function hasMatch(query: string, choice: string): boolean;
}
