import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const storageService = inject(StorageService);
    const token = storageService.getToken();

    if (token) {
        console.log(`AuthInterceptor: Adding Token to ${req.method} ${req.url}`);
        const cloned = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token)
        });
        return next(cloned);
    } else {
        console.warn('AuthInterceptor: No token found in StorageService');
    }

    return next(req);
};
