import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload.component';

export { FileUploadComponent };

@NgModule({
  imports: [CommonModule],
})
export class SharedUiModule {}
