import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      // Verifica atualizações a cada 6 horas
      interval(6 * 60 * 60 * 1000).subscribe(() => swUpdate.checkForUpdate());
      
      // Quando uma atualização estiver disponível
      swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          // Pergunta ao usuário se deseja atualizar
          if (confirm('Uma nova versão está disponível. Deseja atualizar agora?')) {
            window.location.reload();
          }
        }
      });
    }
  }

  checkForUpdates(): void {
    this.swUpdate.checkForUpdate();
  }
}
