import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { WeatherService } from '../../services/weather.service';
import { addIcons } from 'ionicons';
import { personCircleOutline, chevronForward } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AppHeaderComponent implements OnInit {
  @Input() title: string = '';
  @Input() showWeather: boolean = true; // Default to true
  @Input() currentPage: string = '';

  // Weather properties
  temperature: string = '...';
  weatherIconUrl: string = '';
  weatherConditionText: string = '';
  isLoadingWeather: boolean = true;

  constructor(
    private weatherService: WeatherService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router
  ) {
    // Registrar os ícones utilizados no componente
    addIcons({
      'person-circle-outline': personCircleOutline,
      'chevron-forward': chevronForward
    });
  }

  ngOnInit() {
    if (this.showWeather) {
      this.carregarTemperatura();
    }
  }

  // Carrega os dados meteorológicos atuais
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

  // Navega para a página de perfil do desenvolvedor
  showDeveloperProfile() {
    this.router.navigateByUrl('/profile');
  }
}
