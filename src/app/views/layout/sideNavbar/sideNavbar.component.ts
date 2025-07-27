import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NavigationStart, Router, Event } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService } from '@services/web-socket.service';
import { BehaviorSubject } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-sideNavbar',
  templateUrl: './sideNavbar.component.html',
  styleUrls: ['./sideNavbar.component.scss'],
})
export class SideNavbarComponent implements OnInit, AfterViewInit {
  @Output() showSideChange = new EventEmitter<boolean>();
  @ViewChild('sidebar') sidebar!: ElementRef;

  roleId!: number;
  permissions: any = [];
  activeURL: any;
  settledProductsCount: number = 1;
  inventoredProductsCount: number = 0;
  returnAcceptanceCount: number = 0;
  transfersProductsCount: number = 0;
  receivedFromReviewer: number = 0;
  receiveFromReviewer: number = 0;
  incentivePenaltyCount: number = 0;
  currentAccordion: string | null = null;
  isShow: boolean = true;
  private isManualRefresh: boolean = true;
  showSide: boolean = true;

  constructor(
    private router: Router,
    private AuthService: AuthService,
    public auth: AuthService,
    private renderer: Renderer2,
    private el: ElementRef,
    private webSocketService: WebSocketService
  ) {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
  }
  offcanvasElement: any;
  offcanvas: any;
  escPressed: boolean = false;

  ngAfterViewInit(): void {
    this.setupClusterFunctionality();

    this.offcanvasElement = document.getElementById('offcanvasScrolling');
    this.offcanvas = new bootstrap.Offcanvas(this.offcanvasElement);

    this.offcanvasElement.addEventListener(
      'hidden.bs.offcanvas',
      (event: any) => {
        if (this.allowClose()) {
          event.preventDefault();
          event.stopPropagation();
          this.offcanvas.show();
        }
      }
    );
    // this.saveShowSide()
    // this.showSide=false;
    // this.isShow=false
    // localStorage.setItem('showSide',JSON.stringify(this.showSide))
    // this.showSideChange.emit(this.showSide)

    this.offcanvasElement.addEventListener('shown.bs.offcanvas', () => {
      this.showSide = true;
      this.isShow = true;
      localStorage.setItem('showSide', JSON.stringify(this.showSide));
      this.showSideChange.emit(this.showSide);
    });
  }
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.escPressed = true;
    }
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.escPressed = true;
    }
  }

  allowClose(): boolean {
    if (this.escPressed) {
      this.escPressed = false;
      return true;
    }
    return false;
  }

  setupClusterFunctionality() {
    const clusters = document.querySelectorAll('.cluster');
    clusters.forEach((cluster) => {
      const header: any = cluster.querySelector('.cluster-header');
      header.addEventListener('click', () => {
        // Close all other clusters
        clusters.forEach((c) => {
          if (c !== cluster) {
            c.classList.remove('active');
          }
        });
        // Toggle the clicked cluster
        cluster.classList.toggle('active');
      });
    });
  }

  ngOnInit() {
    if (localStorage.getItem('showSide')) {
      let tempShowSide = JSON.parse(String(localStorage.getItem('showSide')));
      if (tempShowSide == false) {
        this.showSide = false;
        this.isShow = false;
      } else {
        this.showSide = true;
        this.isShow = true;
      }
    } else {
      localStorage.setItem('showSide', JSON.stringify(this.showSide));
    }
    this.showSideChange.emit(this.showSide);
    //get all role permissions
    this.permissions = this.auth.getUserPermissions();

    //websocket for real time actions in sidnav
    this.webSocketService.setupConnectionHandlers();
    this.webSocketService
      .getNewMessageTransfersProducts()
      .subscribe((message: any) => {
        this.transfersProductsCount = message.count;
      });
    this.webSocketService.getReceiveFromReviewer().subscribe((message: any) => {
      this.receiveFromReviewer = message.count;
    });
    this.webSocketService
      .getIncentivePenaltyCount()
      .subscribe((message: any) => {
        console.log('incentivePenaltyCount', message);

        this.incentivePenaltyCount = message.count;
      });
    this.webSocketService
      .getReceivedFromReviewer()
      .subscribe((message: any) => {
        this.receivedFromReviewer = message.count;
      });

    this.webSocketService
      .getNewMessageSettledProducts()
      .subscribe((message: any) => {
        this.settledProductsCount = message.count;
      });
    this.webSocketService
      .getNewMessageInventoryProducts()
      .subscribe((message: any) => {
        this.inventoredProductsCount = message.count;
      });

    this.webSocketService
      .getMessageReturnAcceptanceCount()
      .subscribe((message: any) => {
        this.returnAcceptanceCount = message.count;
      });

    //check window resize
    // this.checkWindowWidth();
    this.activeURL = this.router.url;

    //check active and highlighted headers
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.isManualRefresh = true;

        const targetURL = event.url;

        setTimeout(() => {
          this.navigation();
        }, 300);
      }
    });

    setTimeout(() => {
      this.navigation();
    }, 300);
  }
  lastActive: string = '';
  navigation() {
    //get current url
    this.activeURL = this.router.url;

    document
      .getElementById('transfersRealTimeAction')
      ?.classList.remove('blueRealTime');
    document
      .getElementById('invintoringRealTimeAction')
      ?.classList.remove('blueRealTime');
    document
      .getElementById('invintoring2RealTimeAction')
      ?.classList.remove('blueRealTime');

    let header = '';
    let body = '';
    let cluster = '';
    let realTimeActions = '';

    //get ids and highlight new active
    if (this.activeURL.includes('/welcome-page')) {
      header = 'headingOne';
    }
    if (this.activeURL.includes('/orders')) {
      if (this.activeURL == '/sales-admin/purchases/orders/register-request') {
        header = 'headingFortySeven';
        body = 'collapseFortySeven';
        cluster = 'purchases_cluster';
      } else if (
        this.activeURL == '/sales-admin/accounting/orders/register-request'
      ) {
        header = 'headingOrdersAccounting';
        body = 'collapseOrdersAccounting';
        cluster = 'accounting_module';
      } else {
        header = 'headingThree';
        body = 'collapseThree';
        cluster = 'sales_cluster';
      }
    } else if (this.activeURL.includes('/complains')) {
      header = 'headingFive';
      body = 'collapseFive';
      cluster = 'sales_cluster';
    } else if (this.activeURL.includes('/salesTeam')) {
      header = 'headingTwo';
      body = 'collapseTwo';
      cluster = 'sales_cluster';
    } else if (this.activeURL.includes('/clients')) {
      // header = 'headingFour'
      // body = 'collapseFour'
      if (
        this.activeURL == '/sales-admin/clients/supplier-interaction-volume'
      ) {
        header = 'headingForty';
        body = 'collapseForty';
        cluster = 'sales_cluster';
      } else if (
        this.activeURL ==
        '/sales-admin/clients/supplier-transaction-volume-cash'
      ) {
        cluster = 'purchases_cluster';
      } else {
        header = 'headingFour';
        body = 'collapseFour';
        cluster = 'sales_cluster';
      }
    } else if (this.activeURL.includes('/receipts')) {
      header = 'headingSix';
      body = 'collapseSix';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/housing')) {
      header = 'headingSeven';
      body = 'collapseSeven';
      cluster = 'warehouse_cluster';
    } else if (
      this.activeURL.includes('/preparing-products-retail') ||
      this.activeURL.includes('/prepared-products-retail')
    ) {
      header = 'headingEight';
      body = 'collapseEight';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/bulk-products-preparer')) {
      header = 'headingTen';
      body = 'collapseTen';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/products-sales-reviewer/single')) {
      header = 'headingNine';
      body = 'collapseNine';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/receiving-auditor')) {
      header = 'headingEleven';
      body = 'collapseEleven';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('storekeeper/customer-returns')) {
      header = 'headingthirteen';
      body = 'collapsethirteen';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/inventory-and-stock-balance')) {
      if (
        this.activeURL.includes(
          '/warehouse/storekeeper/Inventory-of-Items-and-Warehouses/accounting/inventory-and-stock-balance'
        )
      ) {
        header = 'headingInventoryBalanceAccounting';
        body = 'collapseInventoryBalanceAccounting';
        cluster = 'accounting_module';
      } else {
        header = 'headingTwelve';
        body = 'collapseTwelve';
        cluster = 'warehouse_cluster';
      }
    } else if (this.activeURL.includes('/product-movement')) {
      if (
        this.activeURL.includes(
          '/warehouse/storekeeper/accounting/product-movement'
        )
      ) {
        header = 'headingProductMovementAccounting';
        body = 'collapseProductMovementAccounting';
        cluster = 'accounting_module';
      } else {
        header = 'headingFourteen';
        body = 'collapseFourteen';
        cluster = 'warehouse_cluster';
      }
    } else if (this.activeURL.includes('/products-sales-reviewer/bulk')) {
      header = 'headingFifteen';
      body = 'collapseFifteen';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/warehouse-transfers')) {
      header = 'headingSixteen';
      body = 'collapseSixteen';
      realTimeActions = 'transfersRealTimeAction';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/warehouse-settlement')) {
      header = 'headingSeventeen';
      body = 'collapseSeventeen';
      realTimeActions = 'invintoringRealTimeAction';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('warehouse-inventory')) {
      header = 'headingEighteen';
      body = 'collapseEighteen';
      realTimeActions = 'invintoring2RealTimeAction';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/general-settings')) {
      header = 'headingNineteen';
      body = 'collapseNineteen';
      cluster = 'warehouse_cluster';
    } else if (this.activeURL.includes('/edit-operation')) {
      header = 'headingTwenty';
      body = 'collapseTwenty';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/supply/manage')) {
      header = 'headingTwentyTwo';
      body = 'collapseTwentyTwo';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/supply/create/supply')) {
      header = 'headingTwentyThree';
      body = 'collapseTwentyThree';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/manage-warehouses')) {
      header = 'headingTwentyFour';
      body = 'collapseTwentyFour';
      cluster = 'warehouse_cluster';
    } else if (
      this.activeURL.includes('logs/supply-requests') &&
      !this.activeURL.includes('logs/supply-requests-products')
    ) {
      header = 'headingTwentySix';
      body = 'collapseTwentySix';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('logs/supply-requests-products')) {
      header = 'headingTwentySeven';
      body = 'collapseTwentySeven';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('search-purchase')) {
      header = 'headingTwentyEight';
      body = 'collapseTwentyEight';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('create/purchase-returns')) {
      header = 'headingTwentyEight';
      body = 'collapseTwentyEight';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/market-discount')) {
      header = 'headingThirty';
      body = 'collapseThirty';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/products-warehouses-balance')) {
      header = 'headingThirtyOne';
      body = 'collapseThirtyOne';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/returns-list')) {
      header = 'headingThirtyTwo';
      body = 'collapseThirtyTwo';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/details')) {
      header = 'headingThirtyTwo';
      body = 'collapseThirtyTwo';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/products-list')) {
      header = 'headingThirtyThree';
      body = 'collapseThirtyThree';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/combined')) {
      header = 'headingThirtyFour';
      body = 'collapseThirtyFour';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/transfers/transferd-orders')) {
      header = 'headingThirtySix';
      body = 'collapseThirtySix';
      realTimeActions = 'purchasesTransfersRealTimeAction';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/transfers/transferd-products')) {
      header = 'headingThirtySix';
      body = 'collapseThirtySix';
      realTimeActions = 'purchasesTransfersRealTimeAction';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/transfers/register')) {
      header = 'headingThirtySix';
      body = 'collapseThirtySix';
      realTimeActions = 'purchasesTransfersRealTimeAction';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/Item-inactivity-reports')) {
      header = 'headingThirtySeven';
      body = 'collapseThirtySeven';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/prohibited-expirations')) {
      header = 'headingThirtyEight';
      body = 'collapseThirtyEight';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('expirations-and-operations/reports')) {
      header = 'headingThirtyNine';
      body = 'collapseThirtyNine';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/supplier-interaction-volume')) {
      header = 'headingForty';
      body = 'collapseForty';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/grouped-account-statement')) {
      header = 'headingFortyOne';
      body = 'collapseFortyOne';
      cluster = 'purchases_cluster';
    } else if (
      this.activeURL.includes('/suppliers') ||
      this.activeURL.includes('add/supplier')
    ) {
      header = 'headingFortyTwo';
      body = 'collapseFortyTwo';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/inventory/')) {
      header = 'headingFortyThree';
      body = 'collapseFortyThree';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/offers/')) {
      header = 'headingFortyfour';
      body = 'collapseFortyfour';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/account-statement')) {
      header = 'headingFortyFive';
      body = 'collapseFortyFive';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/electronic-receipt')) {
      header = 'headingFortySeven';
      body = 'collapseFortySeven';
      cluster = 'delivery_cluster';
    } else if (this.activeURL.includes('/receive')) {
      header = 'headingFortyEight';
      body = 'collapseFortyEight';
      cluster = 'delivery_cluster';
    } else if (this.activeURL.includes('/receive')) {
      header = 'headingFortyNine';
      body = 'collapseFortyNine';
      cluster = 'delivery_cluster';
    } else if (this.activeURL.includes('/reports')) {
      header = 'headingFifty';
      body = 'collapseFifty';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/manufacturers')) {
      header = 'headingManufacturer';
      body = 'collapseFortyManufactrures';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/accounting/supervisor-clients/list')) {
      header = 'headingSupervisorList';
      body = 'collapseSupervisorList';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/accounting/deficit-and-surplus')) {
      header = 'headingDeficitAndSurplus';
      body = 'collapseDeficitAndSurplus';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/accounting/todays-earnings')) {
      header = 'headingTodaysEarnings';
      body = 'collapseTodaysEarnings';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/accounting/late-payments')) {
      header = 'headingLatePayments';
      body = 'collapseLatePayments';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/accounting/accounting-safe')) {
      header = 'headingAccountingSafe';
      body = 'collapseAccountingSafe';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/accounting/cash-safe')) {
      header = 'headingCashSafe';
      body = 'collapseCashSafe';
      cluster = 'accounting_module';
    } else if (
      this.activeURL.includes('/consolidated-customer-account-statement')
    ) {
      header = 'heading200';
      body = 'collapse200';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/customer-account-statement')) {
      header = 'heading201';
      body = 'collapse201';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/products/add')) {
      header = 'headingFortysix';
      body = 'collapseFortysix';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/products/list')) {
      header = 'headingProductsList';
      body = 'collapseProductsList';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/purchases/orders')) {
      header = 'headingFortySeven';
      body = 'collapseFortySeven';
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('/supplier-transaction-volume-cash')) {
      cluster = 'purchases_cluster';
    } else if (this.activeURL.includes('storekeeper/customer-returns')) {
      header = 'headingLogbooks';
      body = 'collapseLogbooks';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/safe')) {
      header = 'headingSafes';
      body = 'collapseSafes';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/incentives-or-penalties')) {
      header = 'headingIncentivesOrPenalties';
      body = 'collapseIncentivesOrPenalties';
      realTimeActions = 'incentivePenaltyCountsRealTimeAction';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/accounts')) {
      header = 'headingAccounts1';
      body = 'collapseAccounts1';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/cash-receipts')) {
      header = 'headingCashReceipts';
      body = 'collapseCashReceipts';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/cash-payments')) {
      header = 'headingCashPayments';
      body = 'collapseCashPayments';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/cash-transfer')) {
      header = 'headingCashTransfer';
      body = 'collapseCashTransfer';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('accounting/add-and-deduction-notice')) {
      header = 'headingAddAndDeductionNotice';
      body = 'collapseAddAndDeductionNotice';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/purchases/supply/account-statement')) {
      header = 'headingSupplierTransaction';
      body = 'collapseSupplierTransaction';
      cluster = 'accounting_module';
    } else if (this.activeURL.includes('/purchases/supply/account-statement')) {
      header = 'headingTransferBalance';
      body = 'collapseTransferBalance';
      cluster = 'accounting_module';
    } else if (
      this.activeURL.includes(
        '/sales-admin/clients/supplier-transaction-volume-cash'
      )
    ) {
      header = 'headingSupplierCombinedReport';
      body = 'collapseSupplierCombinedReport';
      cluster = 'accounting_module';
    }
    //reser highlight only if change in header
    const bodies = document.querySelectorAll('.accordion-collapse');
    bodies.forEach((body) => {
      if (this.lastActive != header) {
        body.classList.remove('show');
      }
    });

    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach((head) => {
      if (this.lastActive != header) {
        head.classList.remove('active_header');
      }
    });

    if (cluster) {
      document.getElementById(cluster)?.classList.add('active');
    }

    if (body) {
      document.getElementById(body)?.classList.add('show');
    }
    if (realTimeActions) {
      document.getElementById(realTimeActions)?.classList.add('blueRealTime');
    }

    if (header) {
      this.lastActive = header;
      document.getElementById(header)!.classList.add('active_header');
      const DOM_element = document.getElementById(header);
      if (DOM_element) {
        if (this.sidebar && this.sidebar.nativeElement) {
          // Calculate the element's position relative to the sidebar
          const sidebarTop =
            this.sidebar.nativeElement.getBoundingClientRect().top;
          const elementPosition = DOM_element.getBoundingClientRect().top;
          const offset = -100; // Adjust as needed

          // Scroll the sidebar container to the calculated position with offset
          this.sidebar.nativeElement.scrollTop +=
            elementPosition - sidebarTop + offset;
          // DOM_element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkWindowWidth();
  }

  checkWindowWidth(): void {
    const width = window.innerWidth;
    this.isShow = width > 1200;
    this.showSide = this.isShow;
    if (this.isShow == true) {
      this.showSide = JSON.parse(String(localStorage.getItem('showSide')));
      this.showSideChange.emit(this.showSide);
    }
  }

  logout() {
    this.AuthService.signOut();
  }

  isExpanded(id: string): boolean {
    return document.getElementById(id)?.classList.contains('show') || false;
  }

  //open add client choose type modal
  @ViewChild('OpenAddModal') OpenAddModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenAddModal.nativeElement;
    el.click();
  }

  toggleAccordion(accordionId: string): void {
    this.currentAccordion =
      this.currentAccordion === accordionId ? null : accordionId;
  }

  saveShowSide() {
    this.showSide = !this.showSide;
    this.isShow = this.showSide;
    this.showSideChange.emit(this.showSide);
    localStorage.setItem('showSide', JSON.stringify(this.showSide));
  }
}
