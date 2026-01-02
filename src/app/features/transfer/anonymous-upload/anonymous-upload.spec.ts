
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnonymousUploadComponent } from './anonymous-upload';
import { FileService } from '../../../services/file.service';
import { StorageService } from '../../../services/storage.service'; // Added
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { TEST_CONSTANTS } from '../../../shared/test-constants';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('AnonymousUploadComponent', () => {
    let component: AnonymousUploadComponent;
    let fixture: ComponentFixture<AnonymousUploadComponent>;
    let mockFileService: any;
    let mockStorageService: any; // Added
    let router: Router;

    beforeEach(async () => {
        mockFileService = {
            uploadAnonymous: jest.fn(),
            upload: jest.fn()
        };

        mockStorageService = {
            isLoggedIn: jest.fn().mockReturnValue(false) // Default to anonymous
        };

        await TestBed.configureTestingModule({
            imports: [CommonModule, RouterTestingModule, AnonymousUploadComponent],
            providers: [
                { provide: FileService, useValue: mockFileService },
                { provide: StorageService, useValue: mockStorageService } // Added
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AnonymousUploadComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should upload a file anonymously without password', fakeAsync(() => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };

        const mockResponse = new HttpResponse({
            body: { message: 'Success', shareToken: 'TOKEN123' }
        });

        mockFileService.uploadAnonymous.mockReturnValue(of(mockResponse));

        component.selectFile(event);
        component.upload();
        tick();

        expect(mockFileService.uploadAnonymous).toHaveBeenCalledWith(mockFile, 1, undefined);
        expect(component.message).toContain('Success');
        expect(component.shareToken).toBe('TOKEN123');
    }));

    it('should upload a file anonymously with CUSTOM expiration', fakeAsync(() => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };

        const mockResponse = new HttpResponse({
            body: { message: 'Success', shareToken: 'TOKEN123' }
        });
        mockFileService.uploadAnonymous.mockReturnValue(of(mockResponse));

        component.selectFile(event);
        component.expirationTime = 3; // CUSTOM 3 DAYS
        component.upload();
        tick();

        expect(mockFileService.uploadAnonymous).toHaveBeenCalledWith(mockFile, 3, undefined); // Verify 3 is passed
    }));

    it('should upload a file anonymously WITH password', fakeAsync(() => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };
        component.currentFile = mockFile;
        const password = TEST_CONSTANTS.FILE_PASSWORD;

        const mockResponse = new HttpResponse({
            body: { message: 'Success', shareToken: 'TOKEN_SECURED' }
        });

        mockFileService.uploadAnonymous.mockReturnValue(of(mockResponse));

        component.selectFile(event);
        component.enablePassword = true;
        component.password = password;
        component.upload();
        tick();

        expect(mockFileService.uploadAnonymous).toHaveBeenCalledWith(mockFile, 1, password);
        expect(component.message).toContain('Success');
    }));

    it('should validate short password', fakeAsync(() => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };

        component.selectFile(event);
        component.enablePassword = true;
        component.password = TEST_CONSTANTS.SHORT_PASSWORD; // Too short
        component.upload();
        tick();

        expect(mockFileService.uploadAnonymous).not.toHaveBeenCalled();
        expect(component.message).toContain('au moins 6 caractères');
    }));

    it('should handle upload error', fakeAsync(() => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const event = { target: { files: { item: () => mockFile, 0: mockFile, length: 1 } } };

        mockFileService.uploadAnonymous.mockReturnValue(throwError(() => ({ error: { message: 'Upload Failed' } })));

        component.selectFile(event);
        component.upload();
        tick();

        expect(component.message).toBe('Upload Failed');
        expect(component.progress).toBe(0);
    }));
});
