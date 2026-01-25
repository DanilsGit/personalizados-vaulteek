import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AnimesResponse,
  DesignsResponse,
  SacoPreviewResponse,
} from '../models/personalizados.model';

@Injectable({
  providedIn: 'root',
})
export class Personalizados {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  /**
   * Obtiene todos los animes disponibles (carpetas del bucket)
   */
  getAnimes(): Observable<AnimesResponse> {
    return this.http.get<AnimesResponse>(`${this.apiUrl}/animes`);
  }

  /**
   * Obtiene los diseños de un anime específico
   */
  getDesigns(anime: string): Observable<DesignsResponse> {
    return this.http.get<DesignsResponse>(`${this.apiUrl}/designs/${anime}`);
  }

  /**
   * Obtiene la URL de una imagen específica
   */
  getImageUrl(anime: string, filename: string): string {
    return `${this.apiUrl}/image/${anime}/${filename}`;
  }

  /**
   * Obtiene el preview del saco personalizado
   */
  getSacoPreview(params: {
    anime: string;
    espalda?: string;
    pecho?: string;
    manga1?: string;
    manga2?: string;
  }): Observable<SacoPreviewResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('anime', params.anime);
    if (params.espalda) queryParams.append('espalda', params.espalda);
    if (params.pecho) queryParams.append('pecho', params.pecho);
    if (params.manga1) queryParams.append('manga1', params.manga1);
    if (params.manga2) queryParams.append('manga2', params.manga2);

    return this.http.get<SacoPreviewResponse>(
      `${this.apiUrl}/saco-preview?${queryParams.toString()}`
    );
  }
}
