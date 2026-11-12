import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  ProductPageSettings,
  ProductsListResponse,
  ProductDetailResponse,
  ProductSettingsResponse
} from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/products`;

  // 1. Products CRUD
  getProducts(filters?: { category?: string; status?: string; search?: string }): Observable<ProductsListResponse> {
    let params = new HttpParams();
    if (filters?.category && filters.category !== 'All' && filters.category !== 'all') {
      params = params.set('category', filters.category);
    }
    if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<ProductsListResponse>(this.API_URL, { params });
  }

  getProductById(idOrCode: number | string): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.API_URL}/${idOrCode}`);
  }

  createProduct(formData: FormData): Observable<{ success: boolean; message: string; product: Product }> {
    return this.http.post<{ success: boolean; message: string; product: Product }>(this.API_URL, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<{ success: boolean; message: string; product: Product }> {
    return this.http.put<{ success: boolean; message: string; product: Product }>(`${this.API_URL}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }

  reorderProducts(items: Array<{ id: number; order_index: number }>): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/reorder`, { items });
  }

  // 2. Page Settings (Hero, Sections, Page-level Downloads, CTA Banner)
  getPageSettings(): Observable<ProductSettingsResponse> {
    return this.http.get<ProductSettingsResponse>(`${this.API_URL}/settings`);
  }

  updatePageSettings(formData: FormData): Observable<{ success: boolean; message: string; settings: ProductPageSettings }> {
    return this.http.put<{ success: boolean; message: string; settings: ProductPageSettings }>(`${this.API_URL}/settings`, formData);
  }

  // 3. Restore / Sync Official Defaults
  seedDefaults(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/seed`, {});
  }
}
