export interface Anime {
  id: string;
  name: string;
  thumbnail: string;
}

export interface Design {
  id: string;
  filename: string;
  name: string;
  url: string;
  publicUrl: string;
}

export interface AnimesResponse {
  success: boolean;
  data: Anime[];
}

export interface DesignsResponse {
  success: boolean;
  anime: string;
  count: number;
  data: Design[];
}

export interface SacoPreviewResponse {
  success: boolean;
  anime: string;
  images: {
    espalda?: string;
    pecho?: string;
    manga1?: string;
    manga2?: string;
  };
}

export interface SacoColor {
  name: string;
  value: string; // nombre de carpeta
  hex: string; // color para mostrar visualmente
}
