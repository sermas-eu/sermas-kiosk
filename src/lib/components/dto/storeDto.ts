import { SupportedAudioTypes } from "@sermas/api-client";

export interface BackgroundStoreDto {
  image: string | undefined; // "stream" -> images that comes from messages
  urlImage: string;
  oldImage?: string;
  messageImage: boolean;
  backgroudAudioUrl: string | undefined;
  backgroudAudioType: SupportedAudioTypes | undefined;
  isBackgroudAudioPlaying: boolean;
}
