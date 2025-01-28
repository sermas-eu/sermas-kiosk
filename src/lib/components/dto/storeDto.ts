import { SupportedAudioTypes } from "@sermas/api-client";

export interface BackgroundStoreDto {
  image: string | undefined; // "stream" -> images that comes from messages
  urlImage: string;
  dafaultImage: string | undefined;
  messageImage: boolean;
  backgroundAudioUrl: string | undefined;
  backgroundAudioType: SupportedAudioTypes | undefined;
  isBackgroundAudioPlaying: boolean;
}
