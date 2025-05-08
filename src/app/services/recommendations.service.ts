import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PlacesService, StructuredPlace } from './places.service';
import { EventosService, Evento } from '../eventos/eventos.service';

// Interface unificada para recomendações
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  type: 'event' | 'place' | 'turistic' | 'beach';
  rating?: number;
  date?: string;
  originalData: any; // Dados originais para referência
  link: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationsService {
  constructor(
    private placesService: PlacesService,
    private eventosService: EventosService
  ) {}

  /**
   * Obtém recomendações de diferentes fontes e as combina aleatoriamente
   * @param limit Número máximo de recomendações a retornar
   * @returns Observable com array de recomendações
   */
  getRecommendations(limit: number = 5): Observable<Recommendation[]> {
    // Buscar dados de diferentes fontes com mais itens do que o necessário
    // para ter uma boa variedade para escolher aleatoriamente
    return forkJoin({
      events: this.eventosService.getEventos(10),
      places: this.placesService.getPlaces(10),
      turisticPlaces: this.placesService.getTuristicPlaces(10),
      beaches: this.placesService.getBeaches(5),
    }).pipe(
      map((results) => {
        const recommendations: Recommendation[] = [];

        // Converter eventos para o formato de recomendação
        if (results.events && results.events.length > 0) {
          const eventRecommendations = results.events.map((event) =>
            this.eventToRecommendation(event)
          );
          recommendations.push(...eventRecommendations);
        }

        // Converter locais para o formato de recomendação
        if (results.places && results.places.length > 0) {
          const placeRecommendations = results.places.map((place) =>
            this.placeToRecommendation(place)
          );
          recommendations.push(...placeRecommendations);
        }

        // Converter locais turísticos para o formato de recomendação
        if (results.turisticPlaces && results.turisticPlaces.length > 0) {
          const turisticRecommendations = results.turisticPlaces.map((place) =>
            this.turisticPlaceToRecommendation(place)
          );
          recommendations.push(...turisticRecommendations);
        }

        // Converter praias para o formato de recomendação
        if (results.beaches && results.beaches.length > 0) {
          const beachRecommendations = results.beaches.map((beach) =>
            this.turisticPlaceToRecommendation(beach, 'beach')
          );
          recommendations.push(...beachRecommendations);
        }

        // Embaralhar e limitar ao número solicitado
        return this.shuffleArray(recommendations).slice(0, limit);
      }),
      catchError((error) => {
        console.error('Erro ao carregar recomendações:', error);
        return of([]);
      })
    );
  }

  /**
   * Converte um evento para o formato de recomendação
   * @param event Objeto de evento
   * @returns Objeto de recomendação
   */
  private eventToRecommendation(event: Evento): Recommendation {
    // Extrair texto puro do HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = event.excerpt?.rendered || '';
    const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

    tempDiv.innerHTML = event.title?.rendered || '';
    const plainTitle = tempDiv.textContent || tempDiv.innerText || '';

    return {
      id: `event-${event.id}`,
      title: plainTitle,
      description: plainDescription,
      imageUrl:
        event.imageUrl ||
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      location: 'Póvoa de Varzim',
      type: 'event',
      date: event.date,
      originalData: event,
      link: event.link,
    };
  }

  /**
   * Converte um local para o formato de recomendação
   * @param place Objeto de local
   * @returns Objeto de recomendação
   */
  private placeToRecommendation(place: any): Recommendation {
    // Extrair texto puro do HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = place.title?.rendered || '';
    const plainTitle = tempDiv.textContent || tempDiv.innerText || '';

    tempDiv.innerHTML = place.excerpt?.rendered || '';
    const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

    return {
      id: `place-${place.id}`,
      title: plainTitle,
      description: plainDescription,
      imageUrl:
        place.imageUrl ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      location:
        place.acf?.location || place.acf?.localizacao || 'Póvoa de Varzim',
      type: 'place',
      rating: place.acf?.rating || null,
      originalData: place,
      link: place.link,
    };
  }

  /**
   * Converte um local turístico para o formato de recomendação
   * @param place Objeto de local turístico
   * @param type Tipo opcional de local para categorização específica
   * @returns Objeto de recomendação
   */
  private turisticPlaceToRecommendation(
    place: StructuredPlace,
    type: 'turistic' | 'beach' = 'turistic'
  ): Recommendation {
    return {
      id: `${type}-${place.nome}`,
      title: place.nome,
      description: place.descricao || '',
      imageUrl:
        place.imagem ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      location: place.localizacao || 'Póvoa de Varzim',
      type: type,
      originalData: place,
      link: place.link,
    };
  }

  /**
   * Embaralha um array usando o algoritmo Fisher-Yates
   * @param array Array a ser embaralhado
   * @returns Array embaralhado
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
