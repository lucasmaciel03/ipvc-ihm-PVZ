import { Component, OnInit } from '@angular/core';
import { EventosService } from './eventos.service';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.page.html',
  styleUrls: ['./eventos.page.scss'],
  standalone: false
})
export class EventosPage implements OnInit {
  eventos: any[] = [];

  constructor(private eventosService: EventosService) {}

  ngOnInit() {
    this.eventosService.getEventos().subscribe(data => {
      this.eventos = data;
    });
  }

  abrirLink(link: string) {
    window.open(link, '_blank');
  }
}
