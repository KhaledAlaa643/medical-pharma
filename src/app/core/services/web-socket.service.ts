import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  fromEvent,
  mapTo,
  merge,
  of,
  startWith,
} from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  public messageSettledProducts$: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );
  public messageTransfersProducts$: BehaviorSubject<string> =
    new BehaviorSubject('');
  public receiveFromReviewer$: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );
  public incentivePenaltyCount$: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );
  public receivedFromReviewer$: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );
  public messageInventoryProducts$: BehaviorSubject<string> =
    new BehaviorSubject('');

  public returnAcceptanceCount$: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );
  socket: Socket;
  constructor() {
    this.socket = io(environment.socketUrl, {
      autoConnect: false,
    });

    let test = this.socket.offAnyOutgoing((data) => {});
    this.setupConnectionHandlers();
  }
  public connect() {
    this.socket.connect();
    this.socket.on('connect', () => {
      console.log('connected');
      this.socket.emit('subscribe', 'settlement');
      this.socket.emit('subscribe', 'transfers');
      this.socket.emit('subscribe', 'inventory');
      this.socket.emit('subscribe', 'receiveFromReviewer');
      this.socket.emit('subscribe', 'receivedFromReviewer');
      this.socket.emit('subscribe', 'returnAcceptanceCount');
      this.socket.emit('subscribe', 'incentivePenaltyCount');
    });
  }
  public disconnect() {
    this.socket.disconnect();
  }

  private createOnline$(): Observable<boolean> {
    return merge(
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false)),
      of(navigator.onLine)
    ).pipe(startWith(navigator.onLine));
  }

  public setupConnectionHandlers() {
    this.createOnline$().subscribe((isOnline) => {
      if (isOnline) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  public close() {
    this.socket.on('close', () => {});
  }
  public getNewMessagePreparing = () => {
    this.socket.on('preparing', (data: any) => {
      try {
        this.message$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.message$.asObservable();
  };

  public getNewMessageHousing = () => {
    this.socket.on('housing', (data: any) => {
      try {
        this.message$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.message$.asObservable();
  };

  public getNewMessageReceipt = () => {
    this.socket.on('receipt', (data: any) => {
      try {
        this.message$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.message$.asObservable();
  };

  public getNewMessagePreparingBulk = () => {
    this.socket.on('bulk_preparing', (data: any) => {
      try {
        this.message$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.message$.asObservable();
  };
  public getNewMessageSettledProducts = () => {
    this.socket.on('settlement', (data: any) => {
      try {
        this.messageSettledProducts$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.messageSettledProducts$.asObservable();
  };
  public getNewMessageTransfersProducts = () => {
    this.socket.on('transfers', (data: any) => {
      try {
        this.messageTransfersProducts$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.messageTransfersProducts$.asObservable();
  };

  public getReceiveFromReviewer = () => {
    this.socket.on('receiveFromReviewer', (data: any) => {
      try {
        this.receiveFromReviewer$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.receiveFromReviewer$.asObservable();
  };

  public getIncentivePenaltyCount = () => {
    this.socket.on('incentivePenaltyCount', (data: any) => {
      try {
        this.incentivePenaltyCount$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.incentivePenaltyCount$.asObservable();
  };

  public getReceivedFromReviewer = () => {
    this.socket.on('receivedFromReviewer', (data: any) => {
      try {
        this.receivedFromReviewer$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.receivedFromReviewer$.asObservable();
  };

  public getNewMessageInventoryProducts = () => {
    this.socket.on('inventory', (data: any) => {
      try {
        this.messageInventoryProducts$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.messageInventoryProducts$.asObservable();
  };

  public getMessageReturnAcceptanceCount = () => {
    this.socket.on('returnAcceptanceCount', (data: any) => {
      try {
        this.returnAcceptanceCount$.next(data);
      } catch (error) {
        console.error('Error in handling socket message:', error);
      }
    });
    return this.returnAcceptanceCount$.asObservable();
  };
}
