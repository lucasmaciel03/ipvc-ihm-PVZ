import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventosService, Evento } from '../eventos/eventos.service';
import {
  PlacesService,
  Place,
  StructuredPlace,
} from '../services/places.service';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService } from '../services/weather.service';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { AppFooterComponent } from '../components/app-footer/app-footer.component';
import {
  RecommendationsService,
  Recommendation,
} from '../services/recommendations.service';
import {
  AnimationService,
  CarouselConfig,
} from '../services/animation.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    RouterModule,
    AppHeaderComponent,
    AppFooterComponent,
  ],
})
export class ExplorePage implements OnInit, AfterViewInit, OnDestroy {
  // Eventos properties
  eventos: Evento[] = [];
  isLoading = true;
  error: string | null = null;
  currentEventIndex = 0;
  private autoScrollInterval: any;

  // Weather properties
  temperature: string = '...';
  weatherIconUrl: string = '';
  weatherConditionText: string = '';
  isLoadingWeather: boolean = true;

  // Places properties - Both regular and turistic places
  places: Place[] = [];
  turisticPlaces: StructuredPlace[] = [];
  isLoadingPlaces = true;
  isLoadingTuristicPlaces = true; // Add separate loading state for turistic places
  placesError: string | null = null;
  turisticPlacesError: string | null = null; // Add separate error state for turistic places

  // Places carousel indexes
  currentPlaceIndex = 0;
  currentTuristicPlaceIndex = 0;
  private placesAutoScrollInterval: any;
  private turisticPlacesAutoScrollInterval: any;

  // Recommendations properties
  recommendations: Recommendation[] = [];
  isLoadingRecommendations = true;
  recommendationsError: string | null = null;
  currentRecommendationIndex = 0;
  private recommendationsAutoScrollInterval: any;

  // Mapeamento de tipo de lugar para ícone
  placeTypeIcons: Record<string, string> = {
    Praias: 'sunny-outline',
    'Zonas Balneares': 'sunny-outline',
    Monumentos: 'business-outline',
    Museus: 'brush-outline',
    Jardins: 'leaf-outline',
    'Espaços Culturais': 'color-palette-outline',
    'Locais Históricos': 'time-outline',
    'Pontos de Interesse': 'location-outline',
    Igrejas: 'home-outline',
    Restaurantes: 'restaurant-outline',
    Hotéis: 'bed-outline',
    Desporto: 'football-outline',
    Lazer: 'beer-outline',
  };

  constructor(
    private eventosService: EventosService,
    private weatherService: WeatherService,
    private placesService: PlacesService,
    private recommendationsService: RecommendationsService,
    private animationService: AnimationService, // Injetar o serviço de animação
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarRecomendacoes(); // Carrega recomendações misturadas
    this.loadEvents(); // Corrigido para usar o método existente
    this.carregarTemperatura();
    this.carregarLocais();
    this.carregarLocaisTuristicos();
  }

  ngAfterViewInit() {
    // Substituir a implementação existente pelo novo serviço de animação
    this.setupCarousels();
  }

  ngOnDestroy() {
    // Limpar todas as animações ao sair da página
    this.animationService.cleanupAll();
  }

  // Configurar todos os carrosséis usando o serviço de animação
  private setupCarousels() {
    // Configurar o carrossel de recomendações
    const recommendationsConfig: CarouselConfig = {
      selector: '.recommendations-scroll',
      itemWidth: 280,
      gap: 16,
      autoScrollInterval: 5500,
      callback: (index) => {
        this.currentRecommendationIndex = index;
      },
    };

    // Configurar o carrossel de eventos
    const eventsConfig: CarouselConfig = {
      selector: '.events-scroll',
      itemWidth: 280,
      gap: 16,
      autoScrollInterval: 5000,
      callback: (index) => {
        this.currentEventIndex = index;
      },
    };

    // Configurar o carrossel de locais
    const placesConfig: CarouselConfig = {
      selector: '.places-container:nth-of-type(1) .places-scroll',
      itemWidth: 280,
      gap: 16,
      autoScrollInterval: 6000,
      callback: (index) => {
        this.currentPlaceIndex = index;
      },
    };

    // Configurar o carrossel de locais turísticos
    const turisticPlacesConfig: CarouselConfig = {
      selector: '.turistic-places-container .places-scroll',
      itemWidth: 280,
      gap: 16,
      autoScrollInterval: 7000,
      callback: (index) => {
        this.currentTuristicPlaceIndex = index;
      },
    };

    // Aguardar mais tempo para DOM estar completamente renderizado
    setTimeout(() => {
      console.log('Configurando carrosséis na página Explore...');

      // Logar informações para depuração
      document.querySelectorAll('.places-container').forEach((el, i) => {
        console.log(`Container ${i + 1}:`, el);
        const scrollEl = el.querySelector('.places-scroll');
        console.log(`  Scroll ${i + 1}:`, scrollEl);
        if (scrollEl) {
          const cards = scrollEl.querySelectorAll('.place-card, .event-card');
          console.log(`  Cards ${i + 1}:`, cards.length);
        }
      });

      // Configurar carrosséis um por um com intervalos para evitar problemas
      this.animationService.setupCarousel(
        'recommendations',
        recommendationsConfig,
        this.changeDetectorRef
      );

      setTimeout(() => {
        this.animationService.setupCarousel(
          'events',
          eventsConfig,
          this.changeDetectorRef
        );
      }, 500);

      setTimeout(() => {
        this.animationService.setupCarousel(
          'places',
          placesConfig,
          this.changeDetectorRef
        );
      }, 1000);

      setTimeout(() => {
        this.animationService.setupCarousel(
          'turisticPlaces',
          turisticPlacesConfig,
          this.changeDetectorRef
        );

        // Configurar detecção de visibilidade após todo o resto
        setTimeout(() => {
          this.animationService.setupVisibilityDetection(
            'recommendations',
            recommendationsConfig
          );
          this.animationService.setupVisibilityDetection(
            'events',
            eventsConfig
          );
          this.animationService.setupVisibilityDetection(
            'places',
            placesConfig
          );
          this.animationService.setupVisibilityDetection(
            'turisticPlaces',
            turisticPlacesConfig
          );
        }, 500);
      }, 1500);
    }, 2000);
  }

  // Substituir os métodos existentes de auto-scroll pelo novo serviço

  // Remover os métodos abaixo pois agora o serviço de animação os gerencia:
  // - setupEventScrollObserver()
  // - updateCurrentEventIndex()
  // - startAutoScroll()
  // - stopAutoScroll()
  // - setupPlacesScrollObserver()
  // - updateCurrentPlaceIndex()
  // - startPlacesAutoScroll()
  // - stopPlacesAutoScroll()
  // - setupScrollObserver()
  // - updateCurrentIndex()
  // - startCarouselAutoScroll()
  // - stopCarouselAutoScroll()

  // ...existing code para as funções que não lidam com scrolling...

  // Carrega recomendações combinadas e aleatórias
  private carregarRecomendacoes() {
    this.isLoadingRecommendations = true;
    this.recommendationsError = null;

    this.recommendationsService.getRecommendations(8).subscribe({
      next: (recommendations) => {
        // Processar as recomendações - mantendo as descrições originais quando existirem
        this.recommendations = recommendations.map((rec) => {
          // Só adicionar descrição padrão se não houver descrição na API
          if (!rec.description || rec.description.trim() === '') {
            return {
              ...rec,
              description: this.gerarDescricaoPadrao(rec.type, rec.title),
            };
          }
          return rec;
        });

        this.isLoadingRecommendations = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar recomendações:', error);
        this.recommendationsError =
          'Não foi possível carregar as recomendações.';
        this.isLoadingRecommendations = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // Carrega os dados meteorológicos atuais da WeatherAPI
  private carregarTemperatura() {
    this.isLoadingWeather = true;

    this.weatherService.getCurrentWeather().subscribe({
      next: (data) => {
        // Arredondar a temperatura para o número inteiro mais próximo
        this.temperature = Math.round(data.current.temp_c).toString();

        // Salvar a URL do ícone e texto da condição
        this.weatherIconUrl = data.current.condition.icon;
        this.weatherConditionText = data.current.condition.text;

        this.isLoadingWeather = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar dados meteorológicos:', error);
        // Valores padrão em caso de erro
        this.temperature = '18';
        this.weatherIconUrl =
          'https://cdn.weatherapi.com/weather/64x64/day/116.png';
        this.weatherConditionText = 'Parcialmente nublado';
        this.isLoadingWeather = false;
      },
    });
  }

  // Carrega os locais recomendados
  private carregarLocais() {
    this.isLoadingPlaces = true;
    this.placesService.getPlaces(5).subscribe({
      next: (places) => {
        this.places = places;
        this.isLoadingPlaces = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar locais recomendados:', error);
        this.placesError = 'Não foi possível carregar os locais recomendados.';
        this.isLoadingPlaces = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // Carrega os locais turísticos
  private carregarLocaisTuristicos() {
    this.isLoadingTuristicPlaces = true;
    this.turisticPlacesError = null;

    this.placesService.getTuristicPlaces(5).subscribe({
      next: (places) => {
        // Process the places to add default location only if needed
        // and add default description only if missing
        this.turisticPlaces = places.map((place) => {
          const updatedPlace = { ...place };

          // Ensure location is set
          if (
            !updatedPlace.localizacao ||
            updatedPlace.localizacao.trim() === ''
          ) {
            updatedPlace.localizacao = 'Póvoa de Varzim';
          }

          // Add description only if completely missing
          if (!updatedPlace.descricao || updatedPlace.descricao.trim() === '') {
            updatedPlace.descricao = this.gerarDescricaoPadrao(
              place.tipo,
              place.nome
            );
          }

          return updatedPlace;
        });

        console.log('Places loaded successfully:', this.turisticPlaces);
        this.isLoadingTuristicPlaces = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar locais turísticos:', error);
        this.turisticPlacesError =
          'Não foi possível carregar os locais turísticos.';
        this.isLoadingTuristicPlaces = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // Carrega os eventos mais recentes
  private loadEvents() {
    this.isLoading = true;
    this.error = null;

    this.eventosService.getEventos(5).subscribe({
      next: (eventos) => {
        // Processar os eventos mantendo descrições originais quando existirem
        this.eventos = eventos.map((evento) => {
          // Adicionar excerpt padrão somente quando não existir na API
          if (
            !evento.excerpt?.rendered ||
            evento.excerpt.rendered.trim() === ''
          ) {
            evento.excerpt = {
              rendered: `<p>${this.gerarDescricaoPadrao(
                'event',
                evento.title?.rendered || 'Evento'
              )}</p>`,
            };
          }
          return evento;
        });

        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
        this.error =
          'Não foi possível carregar os eventos. Tente novamente mais tarde.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // Retorna o ícone correto para cada tipo de recomendação
  getRecommendationIcon(type: string): string {
    switch (type) {
      case 'event':
        return 'calendar-outline';
      case 'place':
        return 'location-outline';
      case 'turistic':
        return 'business-outline';
      case 'beach':
        return 'sunny-outline';
      default:
        return 'star-outline';
    }
  }

  // Obter cor de badge para cada tipo de recomendação
  getRecommendationBadgeClass(type: string): string {
    switch (type) {
      case 'event':
        return 'badge-event';
      case 'place':
        return 'badge-place';
      case 'turistic':
        return 'badge-turistic';
      case 'beach':
        return 'badge-beach';
      default:
        return '';
    }
  }

  // Obter o ícone apropriado para um tipo de lugar
  getPlaceTypeIcon(tipo: string): string {
    // Verificar correspondência exata
    if (this.placeTypeIcons[tipo]) {
      return this.placeTypeIcons[tipo];
    }

    // Verificar correspondência parcial
    for (const [key, value] of Object.entries(this.placeTypeIcons)) {
      if (
        tipo.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(tipo.toLowerCase())
      ) {
        return value;
      }
    }

    // Ícone padrão se nenhuma correspondência for encontrada
    return 'location-outline';
  }

  // Funções para navegação manual dos carrosséis
  navigateToTuristicPlace(index: number) {
    const config: CarouselConfig = {
      selector: '.turistic-places-container .places-scroll',
      itemWidth: 280,
      gap: 16,
    };
    this.animationService.navigateToItem('turisticPlaces', index, config);
    this.currentTuristicPlaceIndex = index;
  }

  /**
   * Gera uma descrição padrão baseada no tipo e nome do item
   * @param tipo Tipo de item (event, place, turistic, beach, etc)
   * @param nome Nome do item
   * @returns Uma descrição gerada apropriada para o tipo de item
   */
  private gerarDescricaoPadrao(tipo: string, nome: string): string {
    const tipoLower = tipo?.toLowerCase() || '';

    if (tipoLower.includes('event') || tipoLower === 'event') {
      return `Participe neste evento especial na Póvoa de Varzim. ${nome} promete momentos inesquecíveis para todos os participantes.`;
    } else if (
      tipoLower.includes('praia') ||
      tipoLower.includes('balne') ||
      tipoLower === 'beach'
    ) {
      return `Desfrute do mar e da areia nesta deslumbrante praia da Póvoa de Varzim. ${nome} oferece uma experiência única para os visitantes.`;
    } else if (tipoLower.includes('museu') || tipoLower.includes('museum')) {
      return `Descubra a história e cultura no ${nome}. Uma experiência enriquecedora na Póvoa de Varzim.`;
    } else if (
      tipoLower.includes('monumento') ||
      tipoLower.includes('monument')
    ) {
      return `${nome} representa um importante legado histórico da Póvoa de Varzim. Visite e conheça sua história.`;
    } else if (tipoLower.includes('jardim') || tipoLower.includes('park')) {
      return `Um espaço verde para relaxar e aproveitar a natureza. ${nome} é um refúgio de tranquilidade na Póvoa de Varzim.`;
    } else if (tipoLower.includes('turistic') || tipoLower.includes('turís')) {
      return `${nome} é um local turístico imperdível na Póvoa de Varzim. Visite e descubra os encantos deste lugar especial.`;
    } else {
      return `Descubra este local incrível na Póvoa de Varzim. ${nome} é uma das maravilhas da cidade que vale a pena conhecer.`;
    }
  }

  /**
   * Extracts clean text from HTML content with improved null safety
   * @param html HTML string to extract text from
   * @returns Plain text without HTML tags
   */
  extractTextFromHtml(html: string): string {
    if (!html) return '';

    try {
      // Create temporary DOM element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Get text content and trim whitespace
      const text = tempDiv.textContent || tempDiv.innerText || '';
      return text.trim();
    } catch (error) {
      console.error('Error extracting text from HTML:', error);
      return '';
    }
  }
}
