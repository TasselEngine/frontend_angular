import { ShortLinePipe } from './pipes/shortline.pipe';
import { JsonPipe } from './pipes/json.pipe';
import { PaddingDirective } from './directives/padding.directive';
import { FullContentDirective } from './directives/fullcontent.directive';
import { FormatPipe } from './pipes/format.pipe';
import { NgModule } from '@angular/core';
@NgModule({
    declarations: [
        FormatPipe,
        FullContentDirective,
        PaddingDirective,
        JsonPipe,
        ShortLinePipe
    ],
    imports: [],
    providers: [],
    exports: [
        FormatPipe,
        FullContentDirective,
        PaddingDirective,
        JsonPipe,
        ShortLinePipe
    ],
})
export class ExtensionsModule { }
