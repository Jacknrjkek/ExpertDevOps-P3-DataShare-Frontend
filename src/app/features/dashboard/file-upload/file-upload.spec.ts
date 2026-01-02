import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FileUpload } from './file-upload';
import { TEST_CONSTANTS } from '../../../shared/test-constants';
import { FileService } from '../../../services/file.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('FileUpload', () => {
    let component: FileUpload;
    let fixture: ComponentFixture<FileUpload>;
    let mockFileService: any;
    let mockRouter: any;
    let router: Router;

    beforeEach(async () => {
        mockFileService = {
            upload: jest.fn()
        };

        mockRouter = { // Define mockRouter
            navigate: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [CommonModule, FormsModule, RouterTestingModule, FileUpload],
            providers: [
                { provide: FileService, useValue: mockFileService },
                { provide: Router, useValue: mockRouter } // Add Router mock
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FileUpload);
        component = fixture.componentInstance;
        router = TestBed.inject(Router); // Inject the mocked Router
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should upload with password protection', fakeAsync(() => {
        const mockFile = new File(['test'], 'protected.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };
        const password = TEST_CONSTANTS.FILE_PASSWORD;

        const mockResponse = new HttpResponse({
            body: { message: 'Success' }
        });

        mockFileService.upload.mockReturnValue(of(mockResponse));

        component.selectFile(event);
        component.enablePassword = true;
        component.password = password;
        component.upload();
        tick(1000); // Flush timeout

        expect(mockFileService.upload).toHaveBeenCalledWith(mockFile, 1, password);
        expect(component.message).toContain('Success');
        expect(component.progress).toBe(100);
    }));

    it('should fail upload if password enabled but too short', fakeAsync(() => {
        const mockFile = new File(['test'], 'protected.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };

        component.selectFile(event);
        component.enablePassword = true;
        component.password = TEST_CONSTANTS.SHORT_PASSWORD;
        component.upload();
        tick();

        expect(mockFileService.upload).not.toHaveBeenCalled();
        expect(component.message).toContain('6 caractères');
    }));
});
