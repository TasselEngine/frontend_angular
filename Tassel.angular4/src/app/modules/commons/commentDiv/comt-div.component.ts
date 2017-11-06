import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserComment, Creator, ModelType } from '../../../model/app.model';
import { FormatService, ResourcesService, ToastService, IdentityService } from '../../../services/app.service';
import { CommentEditorComponent } from '../commentEditor/comt-editor.component';
import { Subscription } from 'rxjs/Subscription';

interface IVM {
    ShowReply: boolean;
}

@Component({
    selector: 'tassel-common-comtdiv',
    templateUrl: 'comt-div.html',
    styleUrls: [
        'comt-div.scss'
    ]
})
export class CommentDivComponent implements OnDestroy {

    private _vm: IVM = { ShowReply: false };
    public get VM() { return this._vm; }

    @Input('comment')
    private comment: UserComment;
    public get Comment() { return this.comment; }

    @Output()
    OnCommentAdd = new EventEmitter<any>();

    @Output()
    OnCommentDelete = new EventEmitter<any>();

    public get AllResources() { return this.resources.AllStickersGroup; }

    public get CanAct() { return this.identity.IsLogined; }

    private modalSubsc: Subscription;

    constructor(
        public Formator: FormatService,
        private identity: IdentityService,
        private toast: ToastService,
        private resources: ResourcesService) { }

    ngOnDestroy(): void {
        if (this.modalSubsc && !this.modalSubsc.closed) {
            this.modalSubsc.unsubscribe();
        }
    }

    public readonly IsCreator = (comment: UserComment) => {
        const cmt = comment || this.comment;
        return cmt.Creator.UUID === this.identity.CurrentUUID;
    }

    public readonly DeleteClicked = (comment?: UserComment) => {
        const width = window.innerWidth > 400 ? 400 : window.innerWidth - 48;
        const modal = this.toast.WarnModal(undefined, 'Do you really want delete this comment? This action can\'t be rollback.', width, true, false, [() => {
            const comt = comment || this.comment;
            if (comment) {
                comt.ParentType = ModelType.Comment;
                comt.ParentID = this.comment.ID;
            }
            this.OnCommentDelete.emit(comt);
        }, undefined]);
    }

    public readonly ReplyClicked = (mentioned?: Creator) => {
        const width = window.innerWidth > 800 ? 800 : window.innerWidth - 48;
        const modal = this.toast.ComponentModal(undefined, CommentEditorComponent, {
            show: true,
            mentioned: mentioned || this.comment.Creator,
            transparent: true
        }, width, true, false);
        this.modalSubsc = modal.subscribe((result: any) => {
            if (typeof (result) !== 'string') {
                this.AddComment(result);
                modal.destroy();
            } else if (result === 'onDestroy') {
                this.modalSubsc.unsubscribe();
            }
        });
    }

    public readonly AddComment = (vm: any) => {
        if (vm.Mentioned) {
            vm.CommentID = this.comment.ID;
        }
        this.OnCommentAdd.emit(vm);
    }

}