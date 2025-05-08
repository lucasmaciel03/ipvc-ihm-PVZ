import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { PlacesService, StructuredPlace } from '../services/places.service';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { AppFooterComponent } from '../components/app-footer/app-footer.component';

@Component({
  selector: 'app-turismo-page',
  templateUrl: './turismo-page.page.html',
  styleUrls: ['./turismo-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    HttpClientModule, 
    RouterModule,
    AppHeaderComponent,
    AppFooterComponent
  ]
})
export class TurismoPagePage implements OnInit {
  turisticPlaces: StructuredPlace[] = [];
  isLoading = true;
  error: string | null = null;
  filtroAtivo: string | null = null;
  categorias: { nome: string; icone: string }[] = [
    { nome: 'Praias', icone: 'sunny-outline' },
    { nome: 'Monumentos', icone: 'business-outline' },
    { nome: 'Museus', icone: 'brush-outline' },
    { nome: 'Jardins', icone: 'leaf-outline' },
    { nome: 'Todos', icone: 'apps-outline' }
  ];

  // Mapeamento de tipo de lugar para ícone
  placeTypeIcons: Record<string, string> = {
    'Praias': 'sunny-outline',
    'Zonas Balneares': 'sunny-outline',
    'Monumentos': 'business-outline',
    'Museus': 'brush-outline',
    'Jardins': 'leaf-outline',
    'Espaços Culturais': 'color-palette-outline',
    'Locais Históricos': 'time-outline',
    'Pontos de Interesse': 'location-outline',
    'Igrejas': 'home-outline',
    'Restaurantes': 'restaurant-outline',
    'Hotéis': 'bed-outline',
    'Desporto': 'football-outline',
    'Lazer': 'beer-outline'
  };

  constructor(
    private placesService: PlacesService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.carregarLocaisTuristicos();
  }

  carregarLocaisTuristicos() {
    this.isLoading = true;
    this.placesService.getTuristicPlaces(20).subscribe({
      next: (places) => {
        this.turisticPlaces = places;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar locais turísticos:', error);
        this.error = 'Não foi possível carregar os locais turísticos. Tente novamente mais tarde.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // Obter o ícone apropriado para um tipo de lugar
  getPlaceTypeIcon(tipo: string): string {
    // Verificar correspondência exata
    if (this.placeTypeIcons[tipo]) {
      return this.placeTypeIcons[tipo];
    }
    
    // Verificar correspondência parcial
    for (const [key, value] of Object.entries(this.placeTypeIcons)) {
      if (tipo.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(tipo.toLowerCase())) {
        return value;
      }
    }
    
    // Ícone padrão se nenhuma correspondência for encontrada
    return 'location-outline';
  }

  aplicarFiltro(categoria: string) {
    if (categoria === 'Todos') {
      this.filtroAtivo = null;
    } else if (this.filtroAtivo === categoria) {
      this.filtroAtivo = null; // Toggle off if already selected
    } else {
      this.filtroAtivo = categoria;
    }
  }

  getPlacesFiltrados() {
    if (!this.filtroAtivo) {
      return this.turisticPlaces;
    }
    return this.turisticPlaces.filter(place => 
      place.tipo.includes(this.filtroAtivo!) || 
      this.filtroAtivo!.includes(place.tipo)
    );
  }
}
