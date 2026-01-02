import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ShareView } from './share-view';
import { TEST_CONSTANTS } from '../../../shared/test-constants';
import { ShareService } from '../../../services/share.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ShareView', () => {
    let component: ShareView;
    let fixture: ComponentFixture<ShareView>;
    let mockShareService: any;
    let mockRoute: any;

    beforeEach(async () => {
        mockShareService = {
            getShareMetadata: jest.fn().mockReturnValue(of({})),
            downloadProtected: jest.fn().mockReturnValue(of(new Blob())),
            getDownloadUrl: jest.fn()
        };

        mockRoute = {
            snapshot: {
                paramMap: {
                    get: jest.fn().mockReturnValue('TOKEN123')
                }
            }
        };

        await TestBed.configureTestingModule({
            imports: [CommonModule, FormsModule, RouterTestingModule, ShareView],
            providers: [
                { provide: ShareService, useValue: mockShareService },
                { provide: ActivatedRoute, useValue: mockRoute }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShareView);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create and fetch metadata', () => {
        const mockData = { fileName: 'test.txt', size: 123, isProtected: false };
        mockShareService.getShareMetadata.mockReturnValue(of(mockData));
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(mockShareService.getShareMetadata).toHaveBeenCalledWith('TOKEN123');
    });

    it('should handle protected file', () => {
        const mockData = { fileName: 'secret.txt', size: 123, isProtected: true };
        mockShareService.getShareMetadata.mockReturnValue(of(mockData));
        component.ngOnInit();
        expect(component.fileData.isProtected).toBe(true);
    });

    it('should download protected file with correct password', fakeAsync(() => {
        component.fileData = { fileName: 'secret.txt', isProtected: true };
        // Simulate user entering the correct password
        component.password = TEST_CONSTANTS.FILE_PASSWORD;
        component.token = 'TOKEN123';

        const mockBlob = new Blob(['content'], { type: 'text/plain' });
        mockShareService.downloadProtected.mockReturnValue(of(mockBlob));

        // Mock URL.createObjectURL to avoid error in test environment
        window.URL.createObjectURL = jest.fn();
        window.URL.revokeObjectURL = jest.fn();

        component.download();
        tick();

        expect(mockShareService.downloadProtected).toHaveBeenCalledWith('TOKEN123', TEST_CONSTANTS.FILE_PASSWORD);
        expect(component.passwordError).toBe(false);
    }));

    it('should show error if password missing for protected file', () => {
        component.fileData = { fileName: 'secret.txt', isProtected: true };
        component.password = '';
        component.token = 'TOKEN123';

        component.download();

        expect(mockShareService.downloadProtected).not.toHaveBeenCalled();
        expect(component.passwordError).toBe(true);
    });

    it('should show error if download fails (wrong password)', fakeAsync(() => {
        component.fileData = { fileName: 'secret.txt', isProtected: true };
        component.password = 'wrong';
        component.token = 'TOKEN123';

        mockShareService.downloadProtected.mockReturnValue(throwError(() => ({ status: 403 })));

        component.download();
        tick();

        expect(component.passwordError).toBe(true);
        expect(component.errorMessage).toContain('incorrect');
    }));
});
