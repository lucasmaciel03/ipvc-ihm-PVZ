// src/app/services/eventos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Interface para a imagem destacada
export interface EventMedia {
  id: number;
  source_url: string;
  alt_text?: string;
}

// Update the interface for the events
export interface Evento {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  link: string;
  featured_media: number;
  imageUrl?: string;
  meta?: {
    _event_start_time?: string;
    _event_end_time?: string;
    _event_start_date?: string;
    _event_end_date?: string;
    _event_timezone?: string;
    _event_all_day?: string;
    event_date?: string;
    event_schedule?: string;
    location?: string;
    contacts?: string;
  };
  yoast_head_json?: {
    og_image?: {
      url: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private baseUrl = 'https://www.cm-pvarzim.pt/wp-json/wp/v2';
  private eventEndpoint = `${this.baseUrl}/event`;
  private mediaEndpoint = `${this.baseUrl}/media`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém os eventos mais recentes do Custom Post Type "event"
   * @param limit Número máximo de eventos a retornar (padrão: 5)
   * @returns Observable com array de eventos formatados
   */
  getEventos(limit: number = 5): Observable<Evento[]> {
    // Parâmetros da requisição para obter eventos recentes
    const params = {
      per_page: limit.toString(),
      orderby: 'date',
      order: 'desc', // Do mais recente para o mais antigo
      _embed: 'true', // Obter os dados incorporados
    };

    return this.http.get<Evento[]>(this.eventEndpoint, { params }).pipe(
      // Buscar imagens para eventos que têm featured_media
      map((eventos) => {
        return eventos.map((evento) => {
          // Try to get image from Yoast SEO data if available
          if (
            evento.yoast_head_json?.og_image &&
            evento.yoast_head_json.og_image.length > 0
          ) {
            evento.imageUrl = evento.yoast_head_json.og_image[0].url;
          }
          return evento;
        });
      }),
      switchMap((eventos) => {
        if (eventos.length === 0) {
          return of([]);
        }

        // Criar uma lista de observables para requisições de mídia
        const eventosWithMedia = eventos.map((evento) => {
          if (
            !evento.imageUrl &&
            evento.featured_media &&
            evento.featured_media > 0
          ) {
            // Buscar a mídia destacada
            return this.getEventMedia(evento.featured_media).pipe(
              map((media) => {
                return {
                  ...evento,
                  imageUrl: media ? media.source_url : undefined,
                };
              }),
              catchError(() => {
                // Se falhar ao buscar a mídia, retorna o evento sem imagem
                return of({
                  ...evento,
                  imageUrl: undefined,
                });
              })
            );
          } else {
            // Se não tiver featured_media, apenas retorna o evento como está
            return of(evento);
          }
        });

        // Combinar todas as requisições de mídia e retornar os eventos atualizados
        return forkJoin(eventosWithMedia);
      }),
      catchError((error) => {
        console.error('Erro ao buscar eventos da API:', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  /**
   * Busca detalhes da mídia (imagem) pelo ID
   * @param mediaId ID da mídia a ser buscada
   * @returns Observable com os detalhes da mídia
   */
  private getEventMedia(mediaId: number): Observable<EventMedia | null> {
    return this.http.get<EventMedia>(`${this.mediaEndpoint}/${mediaId}`).pipe(
      catchError((error) => {
        console.error(`Erro ao buscar mídia ID ${mediaId}:`, error);
        return of(null);
      })
    );
  }
}
