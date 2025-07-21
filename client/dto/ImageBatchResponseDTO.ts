export interface ImageDTO {
  id: string;
  url: string;
}

export interface ImageBatchResponseDTO {
  images: ImageDTO[];
}