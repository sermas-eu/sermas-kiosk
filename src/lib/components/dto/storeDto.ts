import { SupportedAudioTypes } from "@sermas/api-client";

export interface BackgroundStoreDto {
  image: string | undefined; // "stream" -> images that comes from messages
  urlImage: string;
  oldImage?: string;
  messageImage: boolean;
  backgroundAudioUrl: string | undefined;
  backgroundAudioType: SupportedAudioTypes | undefined;
  isBackgroundAudioPlaying: boolean;
}
