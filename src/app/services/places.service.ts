import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Interface for the imagem destacada
export interface PlaceMedia {
  id: number;
  source_url: string;
  alt_text?: string;
}

// Interface for os tipos de lugares
export interface PlaceType {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// Interface for os locais
export interface Place {
  id: number;
  title: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  featured_media: number;
  link: string;
  acf?: {
    address?: string;
    rating?: number;
    location?: string;
    localizacao?: string;
    morada?: string;
    schedule?: string;
    horario?: string;
    // Other custom fields that might exist
  };
  imageUrl?: string;
  place_type?: number[];
  yoast_head_json?: {
    og_image?: {
      url: string;
      width: number;
      height: number;
    }[];
  };
}

// Interface for the structured places by type
export interface StructuredPlace {
  nome: string;
  tipo: string;
  link: string;
  localizacao?: string;
  imagem?: string;
  descricao?: string;
  imageGallery?: string[]; // Add image gallery support
  horario?: string; // Add schedule information
  rating?: number; // Add rating support
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private baseUrl = 'https://www.cm-pvarzim.pt/wp-json/wp/v2';
  private placeEndpoint = `${this.baseUrl}/place`;
  private placeTypeEndpoint = `${this.baseUrl}/place_type`;
  private mediaEndpoint = `${this.baseUrl}/media`;

  // Lista de slugs de tipos de locais turísticos relevantes
  private relevantPlaceTypes = [
    'zonas-balneares',
    'praias',
    'monumentos',
    'museus',
    'jardins',
    'espacos-culturais',
    'locais-historicos',
    'pontos-de-interesse',
  ];

  constructor(private http: HttpClient) {}

  /**
   * Extracts clean text from HTML content
   * @param html HTML string to extract text from
   * @returns Plain text without HTML tags
   */
  private extractTextFromHtml(html: string): string {
    if (!html) return '';

    // Create temporary DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get text content and trim whitespace
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.trim();
  }

  /**
   * Extracts the first image URL from HTML content
   * @param html HTML content to extract from
   * @returns URL of the first image found or null
   */
  private extractFirstImageFromHtml(html: string): string | null {
    if (!html) return null;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find the first image tag
    const imgElement = tempDiv.querySelector('img');
    return imgElement ? imgElement.src : null;
  }

  /**
   * Gets all image URLs from HTML content
   * @param html HTML content to extract images from
   * @returns Array of image URLs
   */
  private extractAllImagesFromHtml(html: string): string[] {
    if (!html) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find all image tags and extract their src attributes
    const imgElements = tempDiv.querySelectorAll('img');
    return Array.from(imgElements).map((img) => img.src);
  }

  /**
   * Obtém os locais recomendados do Custom Post Type "place"
   * @param limit Número máximo de locais a retornar (padrão: 10)
   * @returns Observable com array de locais formatados
   */
  getPlaces(limit: number = 10): Observable<Place[]> {
    // Parâmetros da requisição para obter locais
    const params = {
      per_page: limit.toString(),
      orderby: 'date',
      order: 'desc', // Do mais recente para o mais antigo
      _fields: 'id,title,excerpt,featured_media,link,acf', // Apenas os campos necessários
    };

    return this.http.get<Place[]>(this.placeEndpoint, { params }).pipe(
      // Buscar imagens para os locais que têm featured_media
      switchMap((places) => {
        if (places.length === 0) {
          return of([]);
        }

        // Criar uma lista de observables para requisições de mídia
        const placesWithMedia = places.map((place) => {
          if (place.featured_media && place.featured_media > 0) {
            // Buscar a mídia destacada
            return this.getPlaceMedia(place.featured_media).pipe(
              map((media) => {
                return {
                  ...place,
                  imageUrl: media ? media.source_url : undefined,
                };
              }),
              catchError(() => {
                // Se falhar ao buscar a mídia, retorna o local sem imagem
                return of({
                  ...place,
                  imageUrl: undefined,
                });
              })
            );
          } else {
            // Se não tiver featured_media, apenas retorna o local como está
            return of(place);
          }
        });

        // Combinar todas as requisições de mídia e retornar os locais atualizados
        return forkJoin(placesWithMedia);
      }),
      catchError((error) => {
        console.error('Erro ao buscar locais da API:', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  /**
   * Busca detalhes da mídia (imagem) pelo ID
   * @param mediaId ID da mídia a ser buscada
   * @returns Observable com os detalhes da mídia
   */
  private getPlaceMedia(mediaId: number): Observable<PlaceMedia | null> {
    const params = {
      _fields: 'id,source_url,alt_text', // Apenas os campos necessários
    };

    return this.http
      .get<PlaceMedia>(`${this.mediaEndpoint}/${mediaId}`, { params })
      .pipe(
        catchError((error) => {
          console.error(`Erro ao buscar mídia ID ${mediaId}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Obtém todos os tipos de lugares (place_type) relevantes
   * @returns Observable com os tipos de lugares
   */
  getRelevantPlaceTypes(): Observable<PlaceType[]> {
    return this.http
      .get<PlaceType[]>(this.placeTypeEndpoint, {
        params: {
          per_page: '100', // Obter um número suficiente para cobrir todos os tipos
          _fields: 'id,name,slug,count', // Apenas campos necessários
        },
      })
      .pipe(
        map((types) =>
          types.filter((type) =>
            // Filtrar apenas tipos relevantes ou com nomes relacionados a atrações turísticas
            this.relevantPlaceTypes.some(
              (relevantSlug) =>
                type.slug.includes(relevantSlug) ||
                relevantSlug.includes(type.slug) ||
                type.name.toLowerCase().includes('turi') ||
                type.name.toLowerCase().includes('muse') ||
                type.name.toLowerCase().includes('praia') ||
                type.name.toLowerCase().includes('monument') ||
                type.name.toLowerCase().includes('histor') ||
                type.name.toLowerCase().includes('cultur') ||
                type.name.toLowerCase().includes('jardim')
            )
          )
        ),
        catchError((error) => {
          console.error('Erro ao obter tipos de lugares:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtém lugares por tipo específico
   * @param typeId ID do tipo de lugar
   * @returns Observable com lugares do tipo especificado
   */
  getPlacesByType(typeId: number): Observable<Place[]> {
    return this.http
      .get<Place[]>(this.placeEndpoint, {
        params: {
          place_type: typeId.toString(),
          per_page: '50', // Obter um número razoável de lugares
          _fields:
            'id,title,content,excerpt,link,acf,featured_media,place_type,yoast_head_json', // Campos necessários incluindo conteúdo
        },
      })
      .pipe(
        // Buscar imagens para locais com featured_media
        switchMap((places) => {
          if (places.length === 0) return of([]);

          const placesWithMedia = places.map((place) => {
            if (place.featured_media && place.featured_media > 0) {
              return this.getPlaceMedia(place.featured_media).pipe(
                map((media) => ({
                  ...place,
                  imageUrl: media ? media.source_url : undefined,
                })),
                catchError(() =>
                  of({
                    ...place,
                    imageUrl: undefined,
                  })
                )
              );
            } else {
              return of(place);
            }
          });

          return forkJoin(placesWithMedia);
        }),
        catchError((error) => {
          console.error(`Erro ao obter lugares do tipo ${typeId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Embaralha um array usando o algoritmo Fisher-Yates
   * @param array Array a ser embaralhado
   * @returns O mesmo array embaralhado
   */
  private shuffleArray<T>(array: T[]): T[] {
    // Clone o array para não modificar o original
    const shuffled = [...array];

    // Implementação do algoritmo de Fisher-Yates para embaralhar
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Obtém todos os lugares turísticos organizados por categoria
   * @param limit Número máximo de locais a retornar (padrão: 5)
   * @returns Observable com lista estruturada de lugares por categoria
   */
  getTuristicPlaces(limit: number = 5): Observable<StructuredPlace[]> {
    return this.getRelevantPlaceTypes().pipe(
      switchMap((types) => {
        if (types.length === 0) return of([]);

        // Para cada tipo, obter os lugares
        const placesByTypeObservables = types.map((type) =>
          this.getPlacesByType(type.id).pipe(
            map((places) => ({
              type,
              places,
            }))
          )
        );

        return forkJoin(placesByTypeObservables);
      }),
      map((results) => {
        // Estruturar os dados no formato desejado
        const structuredPlaces: StructuredPlace[] = [];

        results.forEach((result) => {
          const typeName = result.type.name;

          result.places.forEach((place) => {
            // Extract description from content or excerpt if available
            let descricao = '';
            let imageUrls: string[] = [];

            // First try to get clean text from excerpt
            if (place.excerpt?.rendered) {
              descricao = this.extractTextFromHtml(place.excerpt.rendered);
            }

            // If excerpt is too short or empty, try content
            if (!descricao || descricao.length < 50) {
              if (place.content?.rendered) {
                descricao = this.extractTextFromHtml(place.content.rendered);

                // Limit description length to a reasonable size
                if (descricao.length > 300) {
                  descricao = descricao.substring(0, 297) + '...';
                }
              }
            }

            // Try to extract images from content if available
            if (place.content?.rendered) {
              imageUrls = this.extractAllImagesFromHtml(place.content.rendered);
            }

            // Check if we have a featured image from Yoast SEO data
            let featuredImage = null;
            if (
              place.yoast_head_json?.og_image &&
              place.yoast_head_json.og_image.length > 0
            ) {
              featuredImage = place.yoast_head_json.og_image[0].url;
            }

            // Determine the best image to use
            let bestImage =
              place.imageUrl ||
              featuredImage ||
              (imageUrls.length > 0 ? imageUrls[0] : null);

            // Verificar todos os campos possíveis de localização
            let location = 'Póvoa de Varzim';

            if (place.acf) {
              // Verificação explícita para cada campo possível
              if (
                typeof place.acf.localizacao === 'string' &&
                place.acf.localizacao.trim() !== ''
              ) {
                location = place.acf.localizacao;
              } else if (
                typeof place.acf.location === 'string' &&
                place.acf.location.trim() !== ''
              ) {
                location = place.acf.location;
              } else if (
                typeof place.acf.morada === 'string' &&
                place.acf.morada.trim() !== ''
              ) {
                location = place.acf.morada;
              } else if (
                typeof place.acf.address === 'string' &&
                place.acf.address.trim() !== ''
              ) {
                location = place.acf.address;
              }
            }

            structuredPlaces.push({
              nome: place.title.rendered,
              tipo: typeName,
              link: place.link,
              localizacao: location,
              imagem: bestImage || undefined, // Convert null to undefined to match the interface
              descricao: descricao,
              imageGallery: imageUrls.length > 1 ? imageUrls : undefined, // Only include if multiple images
              horario: place.acf?.horario || place.acf?.schedule,
              rating: place.acf?.rating,
            });
          });
        });

        // Embaralhar e limitar
        return this.shuffleArray(structuredPlaces).slice(0, limit);
      }),
      catchError((error) => {
        console.error('Erro ao obter lugares turísticos:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets only beach-related places from the WordPress API
   * @param limit Maximum number of beaches to return
   * @returns Observable with a list of beaches
   */
  getBeaches(limit: number = 10): Observable<StructuredPlace[]> {
    // Beach-related type slugs
    const beachTypeNames = ['praias', 'zonas-balneares', 'praias-fluviais'];

    return this.getRelevantPlaceTypes().pipe(
      map((types) =>
        types.filter((type) =>
          beachTypeNames.some(
            (beachName) =>
              type.slug.includes(beachName) ||
              type.name.toLowerCase().includes('praia')
          )
        )
      ),
      switchMap((beachTypes) => {
        if (beachTypes.length === 0) return of([]);

        // For each beach type, get the corresponding places
        const beachesObservables = beachTypes.map((type) =>
          this.getPlacesByType(type.id).pipe(
            map((places) => ({
              type,
              places,
            }))
          )
        );

        return forkJoin(beachesObservables);
      }),
      map((results) => {
        // Format the beaches into structured places
        const structuredBeaches: StructuredPlace[] = [];

        results.forEach((result) => {
          const typeName = result.type.name;

          result.places.forEach((place) => {
            // Extract description from excerpt if available
            let descricao = '';
            if (place.excerpt?.rendered) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = place.excerpt.rendered;
              descricao = tempDiv.textContent || tempDiv.innerText || '';
            }

            // Extract images if content is available
            let imageUrls: string[] = [];
            if (place.content?.rendered) {
              imageUrls = this.extractAllImagesFromHtml(place.content.rendered);
            }

            // Check if we have a featured image from Yoast SEO data
            let featuredImage = null;
            if (
              place.yoast_head_json?.og_image &&
              place.yoast_head_json.og_image.length > 0
            ) {
              featuredImage = place.yoast_head_json.og_image[0].url;
            }

            // Determine the best image to use
            let bestImage =
              place.imageUrl ||
              featuredImage ||
              (imageUrls.length > 0 ? imageUrls[0] : null);

            structuredBeaches.push({
              nome: place.title.rendered,
              tipo: typeName,
              link: place.link,
              localizacao:
                place.acf?.localizacao ||
                place.acf?.location ||
                place.acf?.morada ||
                place.acf?.address ||
                'Póvoa de Varzim',
              imagem: bestImage || undefined, // Convert null to undefined to match the interface
              descricao: descricao,
              imageGallery: imageUrls.length > 1 ? imageUrls : undefined,
              horario: place.acf?.horario || place.acf?.schedule,
              rating: place.acf?.rating,
            });
          });
        });

        // Limit to the requested number and return
        return structuredBeaches.slice(0, limit);
      }),
      catchError((error) => {
        console.error('Error fetching beaches:', error);
        return of([]);
      })
    );
  }
}
