import { AppSettings } from "@sermas/toolkit/dto";
import { PlatformAppDto } from "@sermas/toolkit";
import { writable, type Writable } from "svelte/store";
import { AvatarModel } from "@sermas/toolkit/avatar";

export const appReadyStore: Writable<boolean> = writable(false);
export const avatarLoadedStore: Writable<boolean> = writable(false);

export const sessionIdStore: Writable<string | undefined> = writable();

export const appSettingsStore: Writable<AppSettings> = writable();
export const appConfigStore: Writable<PlatformAppDto> = writable();

export const readyplayermeUrl: Writable<string> = writable("");

export const avatarModelStore: Writable<AvatarModel | undefined> = writable();
