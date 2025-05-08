import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { AppFooterComponent } from '../components/app-footer/app-footer.component';

interface Aviso {
  titulo: string;
  data: Date;
  descricao: string;
  tipo: 'info' | 'aviso' | 'alerta' | 'corte';
  icone: string;
}

@Component({
  selector: 'app-avisos-page',
  templateUrl: './avisos-page.page.html',
  styleUrls: ['./avisos-page.page.scss'],
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
export class AvisosPagePage implements OnInit {
  avisos: Aviso[] = [];
  isLoading = true;

  constructor() { }

  ngOnInit() {
    // Simular carregamento de dados
    setTimeout(() => {
      this.avisos = [
        {
          titulo: 'Corte de Água',
          data: new Date(2024, 3, 15, 9, 0),
          descricao: 'Informamos que no dia 15 de abril haverá um corte de água na zona da Avenida dos Banhos entre as 9h e as 12h para manutenção da rede.',
          tipo: 'corte',
          icone: 'water-outline'
        },
        {
          titulo: 'Condicionamento de Trânsito',
          data: new Date(2024, 3, 20, 8, 0),
          descricao: 'Devido a obras na Avenida Mouzinho de Albuquerque, o trânsito estará condicionado entre os dias 20 e 25 de abril. Sugerimos rotas alternativas.',
          tipo: 'aviso',
          icone: 'car-outline'
        },
        {
          titulo: 'Alertas de Tsunami',
          data: new Date(2024, 3, 1, 14, 30),
          descricao: 'Esta é uma mensagem de teste para o sistema de alerta de tsunami. Não é necessária qualquer ação.',
          tipo: 'alerta',
          icone: 'warning-outline'
        },
        {
          titulo: 'Vacinação Sazonal',
          data: new Date(2024, 3, 5, 10, 0),
          descricao: 'Campanha de vacinação sazonal disponível no Centro de Saúde da Póvoa de Varzim entre 5 e 30 de abril para maiores de 65 anos.',
          tipo: 'info',
          icone: 'medkit-outline'
        },
        {
          titulo: 'Interrupção de Energia',
          data: new Date(2024, 3, 18, 14, 0),
          descricao: 'A EDP informa que haverá uma interrupção de energia para manutenção preventiva no dia 18 de abril entre as 14h e as 17h na zona do Bairro Sul.',
          tipo: 'corte',
          icone: 'flash-outline'
        }
      ];
      
      this.isLoading = false;
    }, 1500);
  }

  getAvisoClass(tipo: string): string {
    switch (tipo) {
      case 'info': return 'aviso-info';
      case 'aviso': return 'aviso-warning';
      case 'alerta': return 'aviso-alert';
      case 'corte': return 'aviso-outage';
      default: return '';
    }
  }
}
