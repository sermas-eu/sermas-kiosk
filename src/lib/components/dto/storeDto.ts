export interface BackgroundStoreDto {
  image: string |undefined; // "stream" -> images that comes from messages
  urlImage: string;
  oldImage?: string;
  messageImage: boolean;
  backgroudAudio: boolean;
}
