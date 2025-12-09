import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload } from '../../dashboard/file-upload/file-upload';
import { HeaderComponent } from '../../../layout/header/header';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FileUpload, HeaderComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
