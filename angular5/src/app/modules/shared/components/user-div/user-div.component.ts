import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { TasselNavigationBase } from '../base.component';
import { IdentityService, AdminService, RootService, StatusService, MessageService } from '../../../../services/app.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { UnionUser, RouteStruct, IBottomPopConfig } from '../../../../model/app.model';

@Component({
    selector: 'tassel-usericon-div',
    templateUrl: './user-div.html',
    styleUrls: ['./div.scss']
})
export class UserDivComponent extends TasselNavigationBase implements OnInit, OnDestroy, OnChanges {

    @Input()
    private config: any;
    public get AppMain() { return this.config || {}; }

    @Input()
    private user: UnionUser;
    public get CurrentUser(): UnionUser { return <any>(this.user || {}); }

    @Input()
    private showPopover: boolean;
    public get ShowPopover() { return this.showPopover || false; }
    public set ShowPopover(value: boolean) { this.showPopover = value; }

    public ShowRefresh = false;
    public ShowMenu = false;

    private isAdminView = false;

    public get ShowType() {
        return this.ShowRefresh && !this.ShowSlider ? 'three' : (this.ShowRefresh && this.ShowSlider) || (!this.ShowRefresh && !this.ShowSlider) ? 'two' : 'one';
    }

    private refreshInvoker: Function;
    private routeStruct: RouteStruct;

    public get WindowWidth() { return window.innerWidth; }
    public get IsWideScreen() { return window.innerWidth > 768; }
    public get ShowSlider() { return window.innerWidth > 1280; }

    public get RouteLinks() { return this.navigator.RouteLinks; }

    public get Logined() { return (this.identity && this.identity.IsLogined) || false; }

    public get UnreadCount() { return this.message.Unread.length; }

    constructor(
        private status: StatusService,
        private admin: AdminService,
        private root: RootService,
        private message: MessageService,
        protected router: Router) {
        super(router);
    }

    ngOnInit(): void {
        this.menuInit();
        this.refreshButtonInit();
    }

    ngOnDestroy(): void {
        this.dispose();
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    private menuInit() {
        this.subscribe(this.router.events, (event) => {
            if (!(event instanceof NavigationEnd)) { return; }
            this.ShowMenu = false;
            this.ShowRefresh = false;
            this.isAdminView = false;
            this.refreshInvoker = null;
            this.routeStruct = RouteStruct.Create(this.router.routerState.snapshot.url)
                .DoIncludes(() => this.isAdminView = true, this.navigator.AdminPrefix);
        });
    }

    private refreshButtonInit() {
        this.subscribe(this.root.RefreshButtonSubject, ([toShow, invoker]) => {
            setTimeout(() => {
                this.ShowRefresh = toShow;
                this.refreshInvoker = invoker;
            });
        });
    }

    public ShowMainMenu() {
        const config: IBottomPopConfig = this.isAdminView ? {
            title: 'ADMIN MENU', icon: 'anticon anticon-user', items: [
                { label: 'Dashboard', icon: 'anticon anticon-pie-chart', onClick: () => this.navigator.GoToAdminDashboard() },
                { label: 'Status', icon: 'anticon anticon-bulb', onClick: () => this.navigator.GoToAdminStatus() },
                { label: 'Posts', icon: 'anticon anticon-file-text', onClick: () => { } },
                { label: 'Notes', icon: 'anticon anticon-tag-o', onClick: () => { } },
                { label: 'Home', icon: 'anticon anticon-home', onClick: () => this.navigator.GoHome() },
            ]
        } : {
                title: 'MENU', icon: 'anticon anticon-inbox', items: [
                    { label: 'Home', icon: 'anticon anticon-home', onClick: () => this.navigator.GoHome() },
                    { label: 'Status', icon: 'anticon anticon-bulb', onClick: () => this.RefreshAndGoToStatus() },
                    { label: 'Posts', icon: 'anticon anticon-file-text', onClick: () => { } },
                    { label: 'Notes', icon: 'anticon anticon-tag-o', onClick: () => { } },
                ]
            };
        if (!this.isAdminView && this.Logined && (this.CurrentUser.Role === 'admin' || this.CurrentUser.Role === 'core')) {
            config.items.push({ label: 'Manage', icon: 'anticon anticon-setting', onClick: () => this.navigator.GoToAdminDashboard() });
        }
        this.root.ShowBottomPop(config);
    }

    public RefreshAndGoToStatus() {
        this.status.ClearStatusCollection();
        this.navigator.GoToStatusIndex();
    }

    public ShowUserMenu() {
        const username = this.CurrentUser.FriendlyName;
        const config = {
            title: username, items: [
                { label: 'Profile', onClick: () => this.ToUserProfile() },
                { label: 'Message Box', onClick: () => this.ToMessageBox() },
                { label: 'Logout', onClick: () => this.Logout() },
            ]
        };
        if (this.Logined && (this.CurrentUser.Role === 'admin' || this.CurrentUser.Role === 'core')) {
            config.items.push({ label: 'Manage', onClick: () => this.ToAdminDashboard() });
        }
        this.root.ShowBottomPop(config);
    }

    public RefreshInvoke() {
        if (this.refreshInvoker) {
            this.refreshInvoker();
        }
    }

    public Logout() {
        this.identity.LogoutAsync(async () => {
            this.admin.CheckAccess(false);
            this.hideMenuAndPopover();
            await this.Delay(100);
            this.navigator.GoHome();
        });
    }

    public async ToUserProfile() {
        this.hideMenuAndPopover();
        await this.Delay(100);
        this.navigator.GoToUserProfile();
    }

    public async ToAdminDashboard() {
        this.hideMenuAndPopover();
        await this.Delay(100);
        this.navigator.GoToAdminDashboard();
    }

    public async ToMessageBox() {
        this.hideMenuAndPopover();
        await this.Delay(100);
        this.navigator.GoToUserMessage();
    }

    private hideMenuAndPopover() {
        this.ShowMenu = this.showPopover = false;
    }

}
