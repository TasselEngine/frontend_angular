import { Injectable } from '@angular/core';
import { RouteErrors } from '../../model/app.model';
import { Logger, LoggerService } from 'ws-logger';
import { IdentityService } from '.././identity/identity.service';
import { Router, NavigationExtras } from '@angular/router';
import { I18N } from '../../modules/i18n/i18n.module';

@Injectable()
export class RouterService {

    private readonly profile_patch = 'profile';
    private readonly message_patch = 'message';
    private readonly redirect_patch = 'redirect';
    private readonly details_patch = 'details';
    private readonly dashboard_patch = 'dashboard';
    private readonly status_patch = 'status';
    private readonly notfound_patch = '404';
    private readonly forbidden_patch = '401';

    private readonly index = ['/index'];
    private readonly userRoot = ['/user'];
    private readonly statusRoot = ['/status'];
    private readonly errorsRoot = ['/errors'];
    private readonly adminRoot = ['/admin'];

    private readonly register = [...this.userRoot, 'register'];
    private readonly login = [...this.userRoot, 'login'];
    private readonly error401 = [...this.errorsRoot, this.forbidden_patch];
    private readonly error404 = [...this.errorsRoot, this.notfound_patch];
    private readonly adminDashboard = [...this.adminRoot, this.dashboard_patch];
    private readonly adminStatus = [...this.adminRoot, this.status_patch];

    public get AdminPrefix() { return this.adminRoot; }

    private readonly route_maps: { [key: string]: Array<any> } = {
        'Home': this.index,
        'NotFound': this.error404,
        'Forbidden': this.error401,
        'Register': this.register,
        'Login': this.login,
        'Status': this.statusRoot,
        'AdminDashboard': this.adminDashboard,
        'AdminStatus': this.adminStatus,
    };
    public get RouteLinks() {
        return this.route_maps;
    }

    private get user_name() { return (this.identity.CurrentUser || { UserName: 'unknown' }).UserName; }

    private router: Router;
    private logger: Logger<RouterService>;

    constructor(
        private i18n: I18N,
        private identity: IdentityService,
        private logsrv: LoggerService) {
        this.logger = this.logsrv.GetLogger('RouterService').SetModule('service');
    }

    private routeSafely(commands: any[], navigate_extra?: NavigationExtras) {
        try {
            navigate_extra = navigate_extra || { queryParams: {} };
            navigate_extra.queryParams['locale'] = this.i18n.Language;
            this.router.navigate(commands, navigate_extra);
        } catch (error) {
            this.logger.Error(['Navigation failed', 'see more infomations below here.', error], 'routeSafely');
        }
    }

    public SetRouter(router: Router) {
        this.router = router;
        return this;
    }

    public GoToPath(path: string) {
        this.routeSafely([path]);
    }

    public GoHome() {
        this.routeSafely(this.index);
    }

    public GoToRegister(redirect?: string) {
        if (redirect) {
            this.routeSafely(this.register, { queryParams: { redirect: redirect } });
        } else {
            this.routeSafely(this.register);
        }
    }

    public GoToLogin(redirect?: string) {
        if (redirect) {
            this.routeSafely(this.login, { queryParams: { redirect: redirect } });
        } else {
            this.routeSafely(this.login);
        }
    }

    public GoToNotFound(flag: RouteErrors = RouteErrors.NotFound) {
        this.routeSafely(this.error404, { queryParams: { type: flag } });
    }

    public GoToForbidden(flag: RouteErrors = RouteErrors.Forbidden) {
        this.routeSafely(this.error401, { queryParams: { type: flag } });
    }

    public GoToUserProfile(uname?: string) {
        this.routeSafely([...this.userRoot, uname || this.user_name, this.profile_patch]);
    }

    public GoToUserMessage(uname?: string) {
        this.routeSafely([...this.userRoot, uname || this.user_name, this.message_patch]);
    }

    public GoToUserRedirect(uid: string, from_path: string) {
        this.routeSafely([...this.userRoot, uid, this.redirect_patch], { queryParams: { from: from_path } });
    }

    public GoToStatusIndex() {
        this.routeSafely(this.statusRoot);
    }

    public GoToStatusDetails(statusid: string) {
        this.routeSafely([...this.statusRoot, statusid, this.details_patch]);
    }

    public GoToAdminStatus() {
        this.routeSafely(this.adminStatus);
    }

    public GoToAdminDashboard() {
        this.routeSafely(this.adminDashboard);
    }

}
