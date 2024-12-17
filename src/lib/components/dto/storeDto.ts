import { SupportedAudioTypes } from "@sermas/api-client";

export interface BackgroundStoreDto {
  image: string | undefined; // "stream" -> images that comes from messages
  urlImage: string;
  previousImage?: string;  // In case we want "image" only applied to specific pages, this attribute allows us to go back to the previous image 
  messageImage: boolean;
  backgroundAudioUrl: string | undefined;
  backgroundAudioType: SupportedAudioTypes | undefined;
  isBackgroundAudioPlaying: boolean;
}
