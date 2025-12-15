import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FileList } from './file-list';
import { FileService } from '../../../services/file.service';
import { StorageService } from '../../../services/storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('FileList Component', () => {
    let component: FileList;
    let fixture: ComponentFixture<FileList>;
    let fileServiceMock: any;
    let storageServiceMock: any;

    const mockFiles = [
        { id: 1, originalName: 'file1.txt', size: 100, uploadDate: new Date().toISOString(), expirationDate: new Date(Date.now() + 86400000).toISOString(), downloadCount: 5 }, // Active
        { id: 2, originalName: 'file2.jpg', size: 2000, uploadDate: new Date().toISOString(), expirationDate: new Date(Date.now() - 86400000).toISOString(), downloadCount: 0 }  // Expired
    ];

    beforeEach(async () => {
        fileServiceMock = {
            getFiles: jest.fn().mockReturnValue(of(mockFiles)),
            deleteFile: jest.fn()
        };
        storageServiceMock = {
            getUser: jest.fn().mockReturnValue({ id: 1, email: 'test@test.com' })
        };

        await TestBed.configureTestingModule({
            imports: [FileList, RouterTestingModule],
            providers: [
                { provide: FileService, useValue: fileServiceMock },
                { provide: StorageService, useValue: storageServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FileList);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve files on init', () => {
        expect(fileServiceMock.getFiles).toHaveBeenCalled();
        expect(component.files.length).toBe(2);
    });

    it('should filter files correctly', () => {
        // Default filter 'all'
        expect(component.filteredFiles.length).toBe(2);

        // Filter 'active'
        component.setFilter('active');
        expect(component.filteredFiles.length).toBe(1);
        expect(component.filteredFiles[0].id).toBe(1);

        // Filter 'expired'
        component.setFilter('expired');
        expect(component.filteredFiles.length).toBe(1);
        expect(component.filteredFiles[0].id).toBe(2);
    });

    it('should open delete modal', () => {
        component.openDeleteModal(1);
        expect(component.showDeleteModal).toBeTruthy();
        expect(component.fileToDeleteId).toBe(1);
    });

    it('should delete file successfully', fakeAsync(() => {
        component.openDeleteModal(1);

        fileServiceMock.deleteFile.mockReturnValue(of({ message: 'Deleted successfully' }));

        // Spy on retrieveFiles to ensure it's called after delete
        const retrieveSpy = jest.spyOn(component, 'retrieveFiles');

        component.confirmDelete();

        expect(fileServiceMock.deleteFile).toHaveBeenCalledWith(1);
        expect(component.showDeleteModal).toBeFalsy();
        expect(component.fileToDeleteId).toBeNull();
        expect(component.message).toBe('Deleted successfully');
        expect(retrieveSpy).toHaveBeenCalled();

        // Check timeout message clearing
        tick(3000);
        expect(component.message).toBe('');
    }));

    it('should handle delete error', () => {
        component.openDeleteModal(1);

        fileServiceMock.deleteFile.mockReturnValue(throwError(() => ({ status: 403, error: { message: 'Forbidden' } })));

        component.confirmDelete();

        expect(fileServiceMock.deleteFile).toHaveBeenCalledWith(1);
        expect(component.message).toContain('Forbidden');
    });
});
