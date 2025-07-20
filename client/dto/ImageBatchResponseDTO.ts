export interface ImageDTO {
  id: number;
  url: string;
}

export interface ImageBatchResponseDTO {
  images: ImageDTO[];
}