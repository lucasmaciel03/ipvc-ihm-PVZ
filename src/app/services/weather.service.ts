import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      code: number;
      icon: string; // URL relativa do ícone (ex: "//cdn.weatherapi.com/weather/64x64/day/116.png")
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '558fa39c814b496696c204655250104'; // WeatherAPI key - você deve substituir por uma chave própria em produção
  private apiUrl = 'https://api.weatherapi.com/v1/current.json';

  constructor(private http: HttpClient) { }
  
  /**
   * Converte URL do ícone de tempo para versão de alta resolução
   * @param iconUrl URL do ícone original
   * @returns URL com resolução de 128x128 e protocolo https
   */
  getHighResWeatherIcon(iconUrl: string): string {
    if (!iconUrl) return '';
    return iconUrl.replace("64x64", "128x128").replace(/^\/\//, "https://");
  }
  
  /**
   * Obtém a previsão do tempo atual para Póvoa de Varzim
   * @returns Observable com os dados meteorológicos atuais
   */
  getCurrentWeather(): Observable<WeatherData> {
    const params = {
      key: this.apiKey,
      q: 'Povoa de Varzim',
      aqi: 'no'
    };
    
    return this.http.get<WeatherData>(this.apiUrl, { params }).pipe(
      map(data => {
        // Substituir o ícone pela versão de alta resolução
        if (data.current?.condition?.icon) {
          data.current.condition.icon = this.getHighResWeatherIcon(data.current.condition.icon);
        }
        return data;
      }),
      catchError(error => {
        console.error('Erro ao buscar dados meteorológicos:', error);
        // Retornar dados fictícios em caso de erro
        const fallbackData: WeatherData = {
          location: {
            name: 'Póvoa de Varzim',
            country: 'Portugal'
          },
          current: {
            temp_c: 18,
            condition: {
              text: 'Partly cloudy',
              code: 1003,
              icon: 'https://cdn.weatherapi.com/weather/128x128/day/116.png' // Alta resolução
            }
          }
        };
        return of(fallbackData);
      })
    );
  }
}
