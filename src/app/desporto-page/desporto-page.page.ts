import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { AppFooterComponent } from '../components/app-footer/app-footer.component';

interface Desporto {
  nome: string;
  imagem: string;
  instalacoes: number;
  descricao: string;
}

interface Instalacao {
  nome: string;
  endereco: string;
  tipo: string;
  horario: string;
  imagem: string;
}

@Component({
  selector: 'app-desporto-page',
  templateUrl: './desporto-page.page.html',
  styleUrls: ['./desporto-page.page.scss'],
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
export class DesportoPagePage implements OnInit {
  desportos: Desporto[] = [];
  instalacoes: Instalacao[] = [];
  isLoading = true;
  desportoSelecionado: string | null = null;

  constructor() { }

  ngOnInit() {
    // Simular carregamento de dados
    setTimeout(() => {
      this.desportos = [
        {
          nome: 'Futebol',
          imagem: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f3b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400',
          instalacoes: 5,
          descricao: 'A Póvoa de Varzim possui várias instalações para a prática de futebol, tanto para competição como para lazer.'
        },
        {
          nome: 'Natação',
          imagem: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400',
          instalacoes: 3,
          descricao: 'Piscinas municipais com atividades para todas as idades e níveis de habilidade.'
        },
        {
          nome: 'Basquetebol',
          imagem: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400',
          instalacoes: 2,
          descricao: 'A cidade oferece quadras para a prática de basquetebol em diversos locais.'
        },
        {
          nome: 'Voleibol',
          imagem: 'https://images.unsplash.com/photo-1574271143515-5cddf8da19be?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400',
          instalacoes: 2,
          descricao: 'Quadras de voleibol disponíveis para uso, incluindo voleibol de praia durante o verão.'
        },
        {
          nome: 'Ténis',
          imagem: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400',
          instalacoes: 2,
          descricao: 'Quadras de ténis disponíveis em diferentes locais da cidade.'
        }
      ];
      
      this.instalacoes = [
        {
          nome: 'Complexo Desportivo Municipal',
          endereco: 'Av. Vasco da Gama, Póvoa de Varzim',
          tipo: 'Multiuso',
          horario: 'Segunda a Sábado, 8h-22h',
          imagem: 'https://images.unsplash.com/photo-1542652694-40abf526446e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400'
        },
        {
          nome: 'Estádio do Varzim Sport Club',
          endereco: 'Rua Repatriamento dos Poveiros, Póvoa de Varzim',
          tipo: 'Futebol',
          horario: 'Conforme agenda de jogos e treinos',
          imagem: 'https://images.unsplash.com/photo-1521731978332-9e9e714bdd20?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400'
        },
        {
          nome: 'Piscina Municipal',
          endereco: 'Rua José André, Póvoa de Varzim',
          tipo: 'Natação',
          horario: 'Segunda a Sexta, 8h-21h, Sábado 9h-18h',
          imagem: 'https://images.unsplash.com/photo-1562823083-3cc6c402f346?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400'
        },
        {
          nome: 'Pavilhão Municipal',
          endereco: 'Rua Almeida Garrett, Póvoa de Varzim',
          tipo: 'Multiuso',
          horario: 'Segunda a Sábado, 9h-23h',
          imagem: 'https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400'
        }
      ];
      
      this.isLoading = false;
    }, 1500);
  }

  selecionarDesporto(nome: string) {
    if (this.desportoSelecionado === nome) {
      this.desportoSelecionado = null; // Toggle off if already selected
    } else {
      this.desportoSelecionado = nome;
    }
  }

  getFilteredInstalacoes() {
    if (!this.desportoSelecionado) {
      return this.instalacoes;
    }
    return this.instalacoes.filter(instalacao => 
      instalacao.tipo === this.desportoSelecionado || 
      instalacao.tipo === 'Multiuso'
    );
  }
}
