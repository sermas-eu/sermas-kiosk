import type { PlatformAppDto } from '@sermas/api-client';
import { AppSettings } from '@sermas/toolkit/dto';
import { writable, type Writable } from 'svelte/store';

export const appReadyStore: Writable<boolean> = writable(false);
export const avatarLoadedStore: Writable<boolean> = writable(false);

export const sessionIdStore: Writable<string|undefined> = writable();

export const appSettingsStore: Writable<AppSettings> = writable();
export const appConfigStore: Writable<PlatformAppDto> = writable();

export const readyplayermeUrl: Writable<string> = writable('');
