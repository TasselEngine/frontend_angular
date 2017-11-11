import { RouteStruct } from './../../../model/models/render/route.model';
import { TasselNavigationBase } from './base.component';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Regex } from 'ws-regex';
import { IdentityService } from './../../../services/identity/identity.service';
import { Component, OnInit, HostBinding, Renderer2, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServerService } from '../../../services/server/server.service';
import { pageShowAnimation } from '../../../utils/app.utils';
import { UserType } from '../../../model/models/user/user.contract';
import { RootService, AdminService } from '../../../services/app.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';

@Component({
  selector: 'tassel-root',
  templateUrl: './../views/root.html',
  styleUrls: [
    './../styles/root.scss',
  ]
})
export class RootComponent extends TasselNavigationBase implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('rootContent') rootContent: ElementRef;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;

  public ShowPopover = false;
  public ShowMenu = false;
  public ShowSlider = false;
  public ShowBack = true;
  public HideAll = true;
  public HeadLeft = '0px';
  public HeaRight = '0px';

  private route_type: string;
  public get RouteFlag(): string { return this.route_type; }

  public get AppMain() { return this.server.Config.Main; }

  public get CurrentUser() { return this.identity.CurrentUser; }

  public get PopoverTitle() { return !this.CurrentUser ? 'Unknown' : this.CurrentUser.FriendlyName; }

  public get RouteLinks() { return this.navigator.RouteLinks; }

  private routeStruct: RouteStruct;
  private widthSubp: Subscription;

  constructor(
    public identity: IdentityService,
    private title: Title,
    private admin: AdminService,
    private render: Renderer2,
    private route: ActivatedRoute,
    private root: RootService,
    protected router: Router) { super(identity, router); }

  ngOnInit(): void {
    this.title.setTitle(`${this.server.Config.Main.Title} - ${this.server.Config.Main.Description}`);
    this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) { return; }
      this.WaitAndDo(() => { // refresh width event when navigation event completed.
        this.root.OnWidthChanged(this.rootContent.nativeElement.clientWidth, false);
      }, 100);
      this.ShowMenu = this.HideAll = false;
      this.ShowBack = true;
      this.route_type = undefined;
      const hideAll = () => { this.HideAll = true; this.ShowBack = false; };
      const grayBack = () => { this.ShowBack = false; };
      this.routeStruct = RouteStruct.Create(this.router.routerState.snapshot.url)
        .DoIf(hideAll, this.navigator.RouteLinks.Login)
        .DoIf(hideAll, this.navigator.RouteLinks.Register)
        .DoEach(grayBack, this.navigator.RouteLinks.Home, this.navigator.RouteLinks.Status);
    });
    this.root.WidthSubject.subscribe(value => {
      const isWide = value > 768;
      if (!this.routeStruct) { return; }
      if (this.routeStruct.CheckIf(...this.navigator.RouteLinks.Register) || this.routeStruct.CheckIf(...this.navigator.RouteLinks.Login)) {
        this.ShowBack = !isWide;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.widthSubp) {
      this.widthSubp.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.WaitAndDo(this.checkView, 50);
    this.prepareScroll();
  }

  private prepareScroll = () => {
    const root = this.scrollDiv.nativeElement;
    const scroll_div = this.scrollDiv.nativeElement.parentElement;
    const that = this;
    const onScroll = function () {
      if (this.scrollHeight - this.scrollTop - this.clientHeight < 100) {
        scroll_div.onscroll = null;
        setTimeout(async () => {
          that.root.OnScrollToBottom(scroll_div);
          await that.Delay(1500);
          scroll_div.onscroll = onScroll;
        }, 0);
      }
    };
    scroll_div.onscroll = onScroll;
  }

  private checkView = () => {
    const root = this.rootContent.nativeElement;
    this.root.OnWidthChanged(root.clientWidth);
    if (root.clientWidth > 1280) {
      this.ShowSlider = true;
      this.HeadLeft = '0px';
    } else {
      this.ShowSlider = false;
      this.HeadLeft = '-50px';
    }
    setTimeout(this.checkView, 300);
  }

  public Logout = () => {
    this.identity.LogoutAsync(async () => {
      this.admin.CheckAccess(false);
      this.ShowPopover = this.ShowMenu = false;
      await this.Delay(100);
      this.navigator.GoHome();
    });
  }

  public ToUserProfile = async () => {
    this.ShowPopover = this.ShowMenu = false;
    await this.Delay(100);
    this.navigator.GoToUserProfile();
  }

  public ToAdminDashboard = async () => {
    this.ShowPopover = this.ShowMenu = false;
    await this.Delay(100);
    this.navigator.GoToAdminDashboard();
  }

}
