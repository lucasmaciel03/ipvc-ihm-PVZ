import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventosService, Evento } from '../eventos/eventos.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { AppFooterComponent } from '../components/app-footer/app-footer.component';

interface EventCategory {
  id: string;
  name: string;
  icon: string;
}

interface EventMonth {
  id: number;
  name: string;
}

interface EventLocation {
  id: string;
  name: string;
  selected: boolean;
}

interface DateFilter {
  startDate: string | null;
  endDate: string | null;
}

@Component({
  selector: 'app-eventos-page',
  templateUrl: './eventos-page.page.html',
  styleUrls: ['./eventos-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    AppHeaderComponent,
    AppFooterComponent,
  ],
})
export class EventosPagePage implements OnInit {
  eventos: Evento[] = [];
  filteredEventos: Evento[] = [];
  filteredCount: number = 0;
  isLoading = true;
  error: string | null = null;
  expandedEvents: Set<number> = new Set(); // Track expanded event cards by ID

  // Filter properties
  searchTerm: string = '';
  selectedCategory: string | null = null;
  selectedMonth: number | null = null;
  showAdvancedFilters: boolean = false;
  dateFilter: DateFilter = {
    startDate: null,
    endDate: null,
  };

  // Event categories
  eventCategories: EventCategory[] = [
    { id: 'cultura', name: 'Cultura', icon: 'color-palette-outline' },
    { id: 'desporto', name: 'Desporto', icon: 'football-outline' },
    { id: 'musica', name: 'Música', icon: 'musical-notes-outline' },
    { id: 'gastronomia', name: 'Gastronomia', icon: 'restaurant-outline' },
    { id: 'tradicao', name: 'Tradição', icon: 'people-outline' },
    { id: 'educacao', name: 'Educação', icon: 'school-outline' },
  ];

  // Months for filtering
  eventMonths: EventMonth[] = [
    { id: 0, name: 'Janeiro' },
    { id: 1, name: 'Fevereiro' },
    { id: 2, name: 'Março' },
    { id: 3, name: 'Abril' },
    { id: 4, name: 'Maio' },
    { id: 5, name: 'Junho' },
    { id: 6, name: 'Julho' },
    { id: 7, name: 'Agosto' },
    { id: 8, name: 'Setembro' },
    { id: 9, name: 'Outubro' },
    { id: 10, name: 'Novembro' },
    { id: 11, name: 'Dezembro' },
  ];

  // Locations for filtering
  eventLocations: EventLocation[] = [
    { id: 'centro', name: 'Centro da Cidade', selected: false },
    { id: 'praia', name: 'Zona da Praia', selected: false },
    { id: 'garrett', name: 'Cine-Teatro Garrett', selected: false },
    { id: 'biblioteca', name: 'Biblioteca Municipal', selected: false },
    { id: 'parque', name: 'Parque da Cidade', selected: false },
  ];

  constructor(
    private eventosService: EventosService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarEventos();
  }

  carregarEventos() {
    this.isLoading = true;
    this.eventosService.getEventos(20).subscribe({
      next: (eventos) => {
        this.eventos = eventos;
        this.filteredEventos = [...eventos]; // Initialize filtered results with all events
        this.filteredCount = this.filteredEventos.length;
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

  // Check if an event is expanded
  isExpanded(id: number): boolean {
    return this.expandedEvents.has(id);
  }

  // Toggle event details expansion
  toggleEventDetails(id: number): void {
    if (this.expandedEvents.has(id)) {
      this.expandedEvents.delete(id);
    } else {
      this.expandedEvents.add(id);
    }
    this.changeDetectorRef.detectChanges();
  }

  // Filter methods

  // Apply all active filters
  applyFilters(): void {
    let filtered = [...this.eventos];

    // Apply search term filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((evento) => {
        return (
          evento.title?.rendered.toLowerCase().includes(term) ||
          (evento.excerpt?.rendered &&
            evento.excerpt.rendered.toLowerCase().includes(term)) ||
          (evento.content?.rendered &&
            evento.content.rendered.toLowerCase().includes(term))
        );
      });
    }

    // Apply category filter - Fix the null check here
    if (this.selectedCategory !== null) {
      const category = this.selectedCategory.toLowerCase();
      filtered = filtered.filter((evento) => {
        // In a real app, you would check a property on the evento object
        // Here we're using a simple string match on the content or title
        const content = evento.content?.rendered?.toLowerCase() || '';
        const title = evento.title?.rendered?.toLowerCase() || '';
        const excerpt = evento.excerpt?.rendered?.toLowerCase() || '';

        return (
          content.includes(category) ||
          title.includes(category) ||
          excerpt.includes(category)
        );
      });
    }

    // Apply month filter
    if (this.selectedMonth !== null) {
      filtered = filtered.filter((evento) => {
        const eventDate = new Date(evento.date);
        return eventDate.getMonth() === this.selectedMonth;
      });
    }

    // Apply date range filter
    if (this.dateFilter.startDate || this.dateFilter.endDate) {
      filtered = filtered.filter((evento) => {
        const eventDate = new Date(evento.date);

        if (this.dateFilter.startDate) {
          const startDate = new Date(this.dateFilter.startDate);
          if (eventDate < startDate) return false;
        }

        if (this.dateFilter.endDate) {
          const endDate = new Date(this.dateFilter.endDate);
          if (eventDate > endDate) return false;
        }

        return true;
      });
    }

    // Apply location filters
    const selectedLocations = this.eventLocations
      .filter((loc) => loc.selected)
      .map((loc) => loc.name.toLowerCase());

    if (selectedLocations.length > 0) {
      filtered = filtered.filter((evento) => {
        const location = evento.meta?.location?.toLowerCase() || '';
        return selectedLocations.some((loc) => location.includes(loc));
      });
    }

    // Update filtered results
    this.filteredEventos = filtered;
    this.filteredCount = this.filteredEventos.length;
    this.changeDetectorRef.detectChanges();
  }

  // Filter by category
  filterByCategory(categoryId: string | null): void {
    this.selectedCategory =
      this.selectedCategory === categoryId ? null : categoryId;
    this.applyFilters();
  }

  // Filter by month
  filterByMonth(monthId: number | null): void {
    this.selectedMonth = this.selectedMonth === monthId ? null : monthId;
    this.applyFilters();
  }

  // Toggle advanced filters visibility
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Clear all applied filters
  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedMonth = null;
    this.dateFilter = {
      startDate: null,
      endDate: null,
    };
    this.eventLocations.forEach((loc) => (loc.selected = false));

    this.filteredEventos = [...this.eventos];
    this.filteredCount = this.filteredEventos.length;
    this.changeDetectorRef.detectChanges();
  }

  // Clear just the date filter
  clearDateFilter(): void {
    this.dateFilter = {
      startDate: null,
      endDate: null,
    };
    this.applyFilters();
  }

  // Clear location filters
  clearLocationFilter(): void {
    this.eventLocations.forEach((loc) => (loc.selected = false));
    this.applyFilters();
  }

  // Check if any filter is active
  hasActiveFilters(): boolean {
    return (
      !!this.searchTerm ||
      this.selectedCategory !== null ||
      this.selectedMonth !== null ||
      !!this.dateFilter.startDate ||
      !!this.dateFilter.endDate ||
      this.eventLocations.some((loc) => loc.selected)
    );
  }

  // Check if any location filter is active
  hasLocationFilter(): boolean {
    return this.eventLocations.some((loc) => loc.selected);
  }

  // Get count of selected locations
  getSelectedLocationCount(): number {
    return this.eventLocations.filter((loc) => loc.selected).length;
  }

  // Get category name from ID
  getCategoryName(categoryId: string): string {
    const category = this.eventCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : '';
  }

  // Get month name from ID
  getMonthName(monthId: number): string {
    const month = this.eventMonths.find((m) => m.id === monthId);
    return month ? month.name : '';
  }

  // Create a display string for date filter
  getDateFilterDisplay(): string {
    if (this.dateFilter.startDate && this.dateFilter.endDate) {
      const start = new Date(this.dateFilter.startDate);
      const end = new Date(this.dateFilter.endDate);
      return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
        end.getMonth() + 1
      }`;
    } else if (this.dateFilter.startDate) {
      const start = new Date(this.dateFilter.startDate);
      return `A partir de ${start.getDate()}/${start.getMonth() + 1}`;
    } else if (this.dateFilter.endDate) {
      const end = new Date(this.dateFilter.endDate);
      return `Até ${end.getDate()}/${end.getMonth() + 1}`;
    }
    return '';
  }

  // Determine category for an event (for display badge)
  getCategoryForEvent(evento: Evento): string | null {
    // In a real app, you'd extract this from a property on the evento
    // Here we're doing a simple match against content
    const content = evento.content?.rendered?.toLowerCase() || '';
    const title = evento.title?.rendered?.toLowerCase() || '';

    for (const category of this.eventCategories) {
      if (content.includes(category.id) || title.includes(category.id)) {
        return category.name;
      }
    }

    return null;
  }
}
