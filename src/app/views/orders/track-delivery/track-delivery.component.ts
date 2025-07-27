import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cart } from '@models/cart';
import { client } from '@models/client';
import { pharmacie, shifts } from '@models/pharmacie';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { MapInfoWindow } from '@angular/google-maps';
import { SkeletonLoadingService } from '@services/skeleton-loading.service';
import { GeneralService } from '@services/general.service';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-track-delivery',
  templateUrl: './track-delivery.component.html',
  styleUrls: ['./track-delivery.component.scss'],
})
export class TrackDeliveryComponent implements OnInit {
  private subs = new Subscription();
  order: cart = {} as cart;
  clients: client[] = [];
  shift: shifts[] = [];
  client: client = {} as client;
  pharmacies: pharmacie[] = [];
  pharmacy: pharmacie = {} as pharmacie;
  groupPharmacied: any[] = [];

  latitude: string = '';
  longitude: string = '';
  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 30.0444,
    lng: 31.2357,
  };
  zoom = 15;
  profileImage: any;
  newProfileImg: any;
  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  markerPosition: google.maps.LatLngLiteral = {
    lat: 30.0444,
    lng: 31.2357,
  };

  //----------------------------------------

  constructor(
    private http: HttpService,
    private skeletonLoader: SkeletonLoadingService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private generalService: GeneralService
  ) {}

  trakingOrderForm!: FormGroup;

  ngOnInit(): void {
    this.trakingOrderForm = this.fb.group({
      orderNumber: [''],
      date: [''],
      pharmacyId: [''],
      salesName: [''],
      orderCycle: [''],
    });
    this.getPharmacies();
  }

  formattedDate: any;
  pharmacy_id: any;
  created_at: any;
  getOrder() {
    this.skeletonLoader.chooseSkeletonType(4);
    this.skeletonLoader.showSkeleton();

    const orderNum = this.trakingOrderForm.get('orderNumber')?.value;
    const pharmacyId = this.trakingOrderForm.get('pharmacyId')?.value;
    const rawDate = this.trakingOrderForm.get('date')?.value;

    let formattedDate: string | undefined;

    if (rawDate && !isNaN(new Date(rawDate).getTime())) {
      formattedDate = datePipe.transform(rawDate, 'yyyy-MM-dd') ?? undefined;
    }

    const filter = {
      order_number: orderNum,
      created_at: formattedDate,
      pharmacy_id: pharmacyId,
    };

    const params = Object.fromEntries(
      Object.entries(filter).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ''
      )
    );

    this.subs.add(
      this.http.getReq('orders/follow-up', { params }).subscribe({
        next: (res) => {
          this.order = res.data;

          this.trakingOrderForm
            .get('salesName')
            ?.setValue(this.order.delivery?.name || '');
          this.trakingOrderForm
            .get('orderCycle')
            ?.setValue(
              `من الساعة ${this.order.shift.order_from} إلى الساعة ${this.order.shift.order_to}`
            );

          this.created_at = this.order.created_at;
          this.status = this.order.order_status;

          if (this.status === 1) {
            this.latitude = this.order.latitude;
            this.longitude = this.order.longitude;

            this.markerPosition = {
              lat: Number(this.latitude),
              lng: Number(this.longitude),
            };
            this.center = { ...this.markerPosition };
          }
        },
        complete: () => {
          this.skeletonLoader.hideSkeleton();
        },
      })
    );
  }

  status!: number;

  getPharmacies() {
    let clients: any = [];
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          clients = res.data;
          clients.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacied.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
                client_id: client?.name,
              });
            });
          });
        },
      })
    );
  }

  @ViewChild('userDropdown') userDropdown!: Calendar;
  @ViewChild('orderNumber') orderNumber!: ElementRef<HTMLInputElement>;
  @ViewChild('calendar') calendar!: ElementRef<HTMLInputElement>;
  @ViewChild('pharmacyId') pharmacyId!: ElementRef<HTMLInputElement>;
  @ViewChild('addBtn') addBtn!: ElementRef;

  goToButton(dropdown?: any) {
    if (!dropdown.overlayVisible) {
      this.addBtn.nativeElement.focus();
      dropdown?.close();
    }
  }
}
