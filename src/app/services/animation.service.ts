import { Injectable } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

/**
 * Interface para configuração do carrossel
 */
export interface CarouselConfig {
  selector: string;
  itemWidth: number;
  gap: number;
  autoScrollInterval?: number;
  callback?: (index: number) => void;
}

/**
 * Serviço para gerenciar animações de carrossel em toda a aplicação
 */
@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  private scrollIntervals: Record<string, any> = {};
  private observers: Record<
    string,
    { observer: IntersectionObserver; elements: Element[] }
  > = {};
  private touchData: Record<string, { startX: number; startTime: number }> = {};

  constructor() {}

  /**
   * Inicializa um carrossel com rolagem automática e observador de mudanças
   * @param id Identificador único do carrossel
   * @param config Configuração do carrossel
   * @param changeDetectorRef Detector de mudanças para atualizar a UI
   */
  setupCarousel(
    id: string,
    config: CarouselConfig,
    changeDetectorRef?: ChangeDetectorRef
  ): void {
    // Parar qualquer carrossel existente com o mesmo ID
    this.stopCarousel(id);

    // Configurar o observador de rolagem com um tempo maior de inicialização
    setTimeout(() => {
      const scrollContainer = document.querySelector(config.selector);
      if (scrollContainer) {
        console.log(`Carrossel inicializado: ${id} (${config.selector})`);

        // Adicionar o evento de rolagem
        scrollContainer.addEventListener('scroll', () => {
          if (config.callback) {
            const scrollLeft = scrollContainer.scrollLeft;
            const itemWidth = config.itemWidth + config.gap;
            const index = Math.round(scrollLeft / itemWidth);

            config.callback(index);

            // Atualizar a UI se o detector de mudanças for fornecido
            if (changeDetectorRef) {
              changeDetectorRef.detectChanges();
            }
          }
        });

        // Adicionar eventos touch para melhor controle em dispositivos móveis
        this.setupTouchEvents(id, scrollContainer as HTMLElement, config);

        // Iniciar o auto-scroll se um intervalo for especificado
        if (config.autoScrollInterval && config.autoScrollInterval > 0) {
          this.startAutoScroll(id, config);
        }
      } else {
        console.warn(
          `Não foi possível encontrar o container de scroll: ${config.selector}`
        );

        // Tentativa alternativa com seletores mais específicos
        const tryAlternativeSelectors = () => {
          // Lista de possíveis seletores alternativos
          const alternativesSelectors = [
            `.places-container:nth-of-type(1) .places-scroll`,
            `.places-container:nth-of-type(2) .places-scroll`,
            `.places-container:nth-of-type(3) .places-scroll`,
            `.places-container:nth-of-type(4) .places-scroll`,
            `.turistic-places-container .places-scroll`,
            `.turistic-places-scroll`,
            `.events-container .events-scroll`,
            `.events-scroll`,
            `.recommendations-container .recommendations-scroll`,
            `.recommendations-scroll`,
          ];

          // Tentar cada seletor alternativo
          for (const alternativeSelector of alternativesSelectors) {
            const alternativeContainer =
              document.querySelector(alternativeSelector);
            if (alternativeContainer) {
              console.log(
                `Tentativa bem-sucedida: ${id} usando seletor alternativo: ${alternativeSelector}`
              );

              // Atualizar o seletor na configuração
              config.selector = alternativeSelector;

              // Configurar o carrossel com o novo seletor
              this.setupCarousel(id, config, changeDetectorRef);
              return true;
            }
          }
          return false;
        };

        // Se for o carrossel de locais turísticos, tentar uma abordagem mais específica
        if (id === 'turisticPlaces') {
          // Tentar usar seletores alternativos gerais
          if (!tryAlternativeSelectors()) {
            console.log(
              'Tentativa de identificação manual para locais turísticos'
            );

            // Tentar encontrar qualquer elemento que possa ser o carrossel de locais turísticos
            const potentialTuristicCarousel = document.querySelector(
              '.places-container:not(:first-child) .places-scroll'
            );

            if (potentialTuristicCarousel) {
              console.log(
                'Encontrado possível carrossel de locais turísticos por identificação manual'
              );
              config.selector =
                '.places-container:not(:first-child) .places-scroll';
              this.setupCarousel(id, config, changeDetectorRef);
            } else {
              // Falha em todas as tentativas, programar nova tentativa
              console.warn(
                'Não foi possível encontrar o carrossel de locais turísticos. Programando nova tentativa...'
              );
              setTimeout(
                () => this.setupCarousel(id, config, changeDetectorRef),
                2000
              );
            }
          }
        } else {
          // Para outros carrosséis, tentar seletores alternativos
          tryAlternativeSelectors();
        }
      }
    }, 1500); // Aumento para 1.5 segundos para garantir que o DOM esteja pronto
  }

  /**
   * Configura eventos de toque para interação melhorada em dispositivos móveis
   */
  private setupTouchEvents(
    id: string,
    element: HTMLElement,
    config: CarouselConfig
  ): void {
    // Tocar para iniciar
    element.addEventListener('touchstart', (e) => {
      // Registrar posição inicial e tempo do toque
      this.touchData[id] = {
        startX: e.touches[0].clientX,
        startTime: Date.now(),
      };

      // Parar auto-scroll durante a interação do usuário
      this.stopAutoScroll(id);
    });

    // Fim do toque
    element.addEventListener('touchend', (e) => {
      if (this.touchData[id]) {
        const touchDistance =
          e.changedTouches[0].clientX - this.touchData[id].startX;
        const touchDuration = Date.now() - this.touchData[id].startTime;

        // Se foi um movimento rápido (swipe)
        if (Math.abs(touchDistance) > 50 && touchDuration < 300) {
          const itemWidth = config.itemWidth + config.gap;
          const currentScrollLeft = element.scrollLeft;
          let targetIndex;

          // Determinar direção do swipe
          if (touchDistance > 0) {
            // Swipe para a direita (mostrar item anterior)
            targetIndex = Math.floor(currentScrollLeft / itemWidth) - 1;
          } else {
            // Swipe para a esquerda (mostrar próximo item)
            targetIndex = Math.ceil(currentScrollLeft / itemWidth) + 1;
          }

          // Garantir que o índice esteja dentro dos limites
          const numItems = element.children.length;
          targetIndex = Math.max(0, Math.min(targetIndex, numItems - 1));

          // Rolar para o item alvo
          element.scrollTo({
            left: targetIndex * itemWidth,
            behavior: 'smooth',
          });

          // Chamar o callback
          if (config.callback) {
            config.callback(targetIndex);
          }
        }

        // Reiniciar auto-scroll após um tempo
        setTimeout(() => {
          if (config.autoScrollInterval && config.autoScrollInterval > 0) {
            this.startAutoScroll(id, config);
          }
        }, 2000);
      }
    });

    // Cancelamento de toque
    element.addEventListener('touchcancel', () => {
      // Reiniciar auto-scroll após cancelamento
      setTimeout(() => {
        if (config.autoScrollInterval && config.autoScrollInterval > 0) {
          this.startAutoScroll(id, config);
        }
      }, 2000);
    });
  }

  /**
   * Inicia a rolagem automática de um carrossel
   * @param id Identificador único do carrossel
   * @param config Configuração do carrossel
   */
  startAutoScroll(id: string, config: CarouselConfig): void {
    // Parar qualquer auto-scroll existente
    this.stopAutoScroll(id);

    // Obter o container de scroll novamente (pode ter mudado)
    const scrollContainer = document.querySelector(config.selector);
    if (!scrollContainer) {
      console.warn(`Container de scroll não encontrado: ${config.selector}`);
      return;
    }

    // Contar o número de itens no carrossel
    const items = Array.from(scrollContainer.children).filter(
      (el) =>
        el.classList.contains('place-card') ||
        el.classList.contains('event-card') ||
        el.classList.contains('recommendation-card')
    );

    const itemCount = items.length;

    if (itemCount <= 1) {
      console.log(`Carrossel ${id} não iniciado: menos de 2 itens.`);
      return; // Não fazer auto-scroll se houver apenas 1 ou 0 itens
    }

    let currentIndex = 0;

    // Determinar o índice atual com base na posição de scroll
    const currentScrollLeft = scrollContainer.scrollLeft;
    const itemWidth = config.itemWidth + config.gap;
    currentIndex = Math.round(currentScrollLeft / itemWidth) % itemCount;

    console.log(
      `Auto-scroll iniciado para o carrossel: ${id} - ${itemCount} itens`
    );

    this.scrollIntervals[id] = setInterval(() => {
      const container = document.querySelector(config.selector);
      if (container) {
        // Avançar para o próximo item
        currentIndex = (currentIndex + 1) % itemCount;

        // Calcular a posição de scroll
        const newScrollLeft = currentIndex * itemWidth;

        // Animar o scroll com uma transição suave
        container.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth',
        });

        // Chamar o callback se existir
        if (config.callback) {
          config.callback(currentIndex);
        }
      } else {
        console.warn(
          `Container perdido durante auto-scroll: ${config.selector}`
        );
        this.stopAutoScroll(id);
      }
    }, config.autoScrollInterval || 5000);
  }

  /**
   * Para a rolagem automática de um carrossel
   * @param id Identificador único do carrossel
   */
  stopAutoScroll(id: string): void {
    if (this.scrollIntervals[id]) {
      clearInterval(this.scrollIntervals[id]);
      delete this.scrollIntervals[id];
      console.log(`Auto-scroll parado para o carrossel: ${id}`);
    }
  }

  /**
   * Para completamente um carrossel, removendo observadores e intervalos
   * @param id Identificador único do carrossel
   */
  stopCarousel(id: string): void {
    this.stopAutoScroll(id);

    // Desconectar observadores se existirem
    if (this.observers[id]) {
      const { observer, elements } = this.observers[id];
      elements.forEach((element) => {
        observer.unobserve(element);
      });
      delete this.observers[id];
      console.log(`Observador desconectado para o carrossel: ${id}`);
    }

    // Remover dados de toque
    if (this.touchData[id]) {
      delete this.touchData[id];
    }
  }

  /**
   * Configure a detecção de visibilidade para pausar o carrossel quando não estiver visível
   * @param id Identificador único do carrossel
   * @param config Configuração do carrossel
   */
  setupVisibilityDetection(id: string, config: CarouselConfig): void {
    const container = document.querySelector(config.selector);
    if (!container) {
      console.warn(
        `Container não encontrado para configurar detecção de visibilidade: ${config.selector}`
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Elemento está visível, iniciar auto-scroll
            if (config.autoScrollInterval && config.autoScrollInterval > 0) {
              this.startAutoScroll(id, config);
            }
          } else {
            // Elemento não está visível, parar auto-scroll
            this.stopAutoScroll(id);
          }
        });
      },
      { threshold: 0.2 } // 20% do elemento deve estar visível
    );

    observer.observe(container);

    // Armazenar o observador para limpeza posterior
    this.observers[id] = {
      observer,
      elements: [container],
    };

    console.log(`Detecção de visibilidade configurada para o carrossel: ${id}`);
  }

  /**
   * Navega manualmente para um item específico do carrossel
   * @param id Identificador do carrossel
   * @param index Índice do item para navegar
   * @param config Configuração do carrossel
   */
  navigateToItem(id: string, index: number, config: CarouselConfig): void {
    const container = document.querySelector(config.selector);
    if (!container) return;

    // Pausar o auto-scroll durante a navegação manual
    this.stopAutoScroll(id);

    const itemWidth = config.itemWidth + config.gap;
    const scrollPosition = index * itemWidth;

    // Realizar a rolagem com animação suave
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });

    // Chamar o callback, se existir
    if (config.callback) {
      config.callback(index);
    }

    // Reiniciar o auto-scroll após um tempo
    setTimeout(() => {
      if (config.autoScrollInterval && config.autoScrollInterval > 0) {
        this.startAutoScroll(id, config);
      }
    }, 3000);
  }

  /**
   * Limpar todos os carrosséis e intervalos ao sair da página
   */
  cleanupAll(): void {
    // Parar todos os intervalos
    Object.keys(this.scrollIntervals).forEach((id) => {
      this.stopAutoScroll(id);
    });

    // Desconectar todos os observadores
    Object.keys(this.observers).forEach((id) => {
      const { observer, elements } = this.observers[id];
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    });

    this.observers = {};
    this.touchData = {};
    console.log('Todos os carrosséis foram limpos');
  }

  /**
   * Recarrega todos os carrosséis ativos
   * Este método pode ser chamado quando houver mudanças na interface
   */
  refreshAllCarousels(): void {
    // Recarregar carrosséis ativos
    Object.keys(this.scrollIntervals).forEach((id) => {
      // Obter a configuração atual (isso seria ideal se armazenássemos as configurações)
      // Para simplificar, estamos apenas reiniciando o auto-scroll
      this.stopAutoScroll(id);
      // Idealmente, você manteria a configuração em uma variável para poder reiniciar corretamente
    });

    console.log('Todos os carrosséis foram recarregados');
  }
}
