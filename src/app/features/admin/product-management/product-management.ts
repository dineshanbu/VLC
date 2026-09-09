import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import {
  Product,
  ProductSpecItem,
  ProductResourceItem,
  ProductPageSettings
} from '../../../core/models/product.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

export interface ProductImageItem {
  id: string;
  url: string;
  path: string;
  file?: File;
  isCover: boolean;
  isPackshot: boolean;
}

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-management.html',
  styleUrl: './product-management.css'
})
export class ProductManagementComponent implements OnInit {
  private productService = inject(ProductService);

  // Active Main Navigation Tab: 'catalog' | 'hero' | 'resources' | 'cta'
  activeTab = signal<'catalog' | 'hero' | 'resources' | 'cta'>('catalog');

  // Loading & Feedback States
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // ==========================================
  // 1. PRODUCTS CATALOG STATE
  // ==========================================
  products = signal<Product[]>([]);
  productSearch = signal<string>('');
  selectedCategoryFilter = signal<string>('All');
  selectedStatusFilter = signal<string>('All');

  // Filtered Products
  filteredProducts = computed(() => {
    const list = this.products();
    const search = this.productSearch().toLowerCase().trim();
    const category = this.selectedCategoryFilter();
    const status = this.selectedStatusFilter();

    return list.filter(p => {
      const matchSearch =
        !search ||
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.name_ar && p.name_ar.includes(search)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(search)) ||
        (p.subtitle_ar && p.subtitle_ar.includes(search)) ||
        (p.product_code && p.product_code.toLowerCase().includes(search));

      const matchCategory =
        category === 'All' || p.category === category;

      const matchStatus =
        status === 'All' || p.status === status;

      return matchSearch && matchCategory && matchStatus;
    });
  });

  // KPI Metrics
  totalProductsCount = computed(() => this.products().length);
  commercialCount = computed(() => this.products().filter(p => p.category === 'our-products').length);
  pipelineCount = computed(() => this.products().filter(p => p.category === 'future-portfolio').length);
  activeCount = computed(() => this.products().filter(p => p.status === 'Active').length);

  // ==========================================
  // PRODUCT FORM MODAL STATE
  // ==========================================
  isProductModalOpen = signal<boolean>(false);
  isEditingProduct = signal<boolean>(false);
  currentProductId = signal<number | null>(null);
  productFormLang = signal<'en' | 'ar'>('en');
  activeFormSubTab = signal<'basic' | 'images' | 'features' | 'specs' | 'storage' | 'indication' | 'resources'>('basic');

  productForm = {
    product_code: '',
    category: 'our-products' as 'our-products' | 'future-portfolio',
    name: '',
    name_ar: '',
    subtitle: '',
    subtitle_ar: '',
    image: '',
    featured_image: '',
    description: '',
    description_ar: '',
    features: [] as string[],
    features_ar: [] as string[],
    specs: [] as ProductSpecItem[],
    specs_ar: [] as ProductSpecItem[],
    storage: [] as ProductSpecItem[],
    storage_ar: [] as ProductSpecItem[],
    indication_desc: '',
    indication_desc_ar: '',
    indication_target: '',
    indication_target_ar: '',
    indication_route: '',
    indication_route_ar: '',
    indication_items: [] as ProductSpecItem[],
    indication_items_ar: [] as ProductSpecItem[],
    gallery: [] as string[],
    resources: [] as ProductResourceItem[],
    resources_ar: [] as ProductResourceItem[],
    order_index: 0,
    status: 'Active' as 'Active' | 'Inactive'
  };

  // Master Unified Image Manager
  productImages = signal<ProductImageItem[]>([]);
  newImageUrlInput = '';
  newGalleryImageUrl = '';
  isDraggingOver = false;

  activeCoverItem = computed(() => this.productImages().find(img => img.isCover) || this.productImages()[0] || null);
  activeCoverPreview = computed(() => this.activeCoverItem()?.url || '');
  activeCoverName = computed(() => this.activeCoverItem()?.path || 'None');

  activePackshotItem = computed(() => this.productImages().find(img => img.isPackshot) || this.activeCoverItem());
  activePackshotPreview = computed(() => this.activePackshotItem()?.url || '');

  // Helpers for temporary input entries
  newFeatureEn = '';
  newFeatureAr = '';
  newSpecLabelEn = '';
  newSpecValEn = '';
  newSpecLabelAr = '';
  newSpecValAr = '';
  newStorageLabelEn = '';
  newStorageValEn = '';
  newStorageLabelAr = '';
  newStorageValAr = '';
  newIndicationLabelEn = '';
  newIndicationValEn = '';
  newIndicationLabelAr = '';
  newIndicationValAr = '';

  newResourceNameEn = '';
  newResourceNameAr = '';
  newResourceType = 'PDF';
  newResourceSize = '1.0 MB';
  newResourceIcon: 'document' | 'prescribing' | 'patient' | 'certificate' = 'document';

  // ==========================================
  // LIVE PREVIEW MODAL STATE
  // ==========================================
  isPreviewModalOpen = signal<boolean>(false);
  previewProduct = signal<Product | null>(null);
  previewLang = signal<'en' | 'ar'>('en');
  previewViewMode = signal<'card' | 'modal'>('card');
  previewActiveTab = signal<string>('Overview');
  previewThumbnailIdx = signal<number>(0);

  // ==========================================
  // DELETE CONFIRMATION MODAL
  // ==========================================
  isDeleteModalOpen = signal<boolean>(false);
  productToDelete = signal<Product | null>(null);

  // ==========================================
  // 2. PAGE SETTINGS & HERO / CTA STATE
  // ==========================================
  pageSettings = signal<ProductPageSettings | null>(null);
  heroSettingsLang = signal<'en' | 'ar'>('en');
  ctaSettingsLang = signal<'en' | 'ar'>('en');

  heroForm = {
    hero_badge: 'OUR PRODUCTS',
    hero_badge_ar: 'منتجاتنا',
    hero_title_part1: 'Innovative Vaccines.',
    hero_title_part1_ar: 'لقاحات مبتكرة.',
    hero_title_part2: 'Trusted ',
    hero_title_part2_ar: 'حماية ',
    hero_title_accent: 'Protection.',
    hero_title_accent_ar: 'موثوقة.',
    hero_description: '',
    hero_description_ar: '',
    hero_image: 'home_banner.png',
    section_eyebrow: 'OUR PRODUCTS',
    section_eyebrow_ar: 'منتجاتنا الدوائية'
  };
  heroImageFile: File | null = null;
  heroImagePreview: string | null = null;

  ctaForm = {
    cta_badge: 'STRATEGIC COLLABORATION',
    cta_badge_ar: 'شراكة استراتيجية',
    cta_title_part1: 'Building a Healthier Future, ',
    cta_title_part1_ar: 'نبني مستقبلاً أكثر صحة، ',
    cta_title_accent: 'Together.',
    cta_title_accent_ar: 'معاً.',
    cta_description: '',
    cta_description_ar: '',
    cta_btn_text: 'Explore Partnerships',
    cta_btn_text_ar: 'استكشف شراكاتنا',
    cta_link: '/partners'
  };

  // Page-level Resources
  pageResources = signal<ProductResourceItem[]>([]);
  newPageResName = '';
  newPageResNameAr = '';
  newPageResType = 'PDF';
  newPageResSize = '1.0 MB';
  newPageResIcon: 'document' | 'prescribing' | 'patient' | 'certificate' = 'document';

  ngOnInit(): void {
    this.loadAllData();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================
  loadAllData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProducts().subscribe({
      next: res => {
        if (res && res.success) {
          this.products.set(res.products || []);
        }
        this.loadSettings();
      },
      error: err => {
        console.error('Failed to load products', err);
        this.errorMessage.set('Failed to connect to backend server. Make sure MySQL and Node API are running.');
        this.isLoading.set(false);
      }
    });
  }

  loadSettings(): void {
    this.productService.getPageSettings().subscribe({
      next: res => {
        if (res && res.success && res.settings) {
          const s = res.settings;
          this.pageSettings.set(s);

          this.heroForm = {
            hero_badge: s.hero_badge || 'OUR PRODUCTS',
            hero_badge_ar: s.hero_badge_ar || 'منتجاتنا',
            hero_title_part1: s.hero_title_part1 || 'Innovative Vaccines.',
            hero_title_part1_ar: s.hero_title_part1_ar || 'لقاحات مبتكرة.',
            hero_title_part2: s.hero_title_part2 || 'Trusted ',
            hero_title_part2_ar: s.hero_title_part2_ar || 'حماية ',
            hero_title_accent: s.hero_title_accent || 'Protection.',
            hero_title_accent_ar: s.hero_title_accent_ar || 'موثوقة.',
            hero_description: s.hero_description || '',
            hero_description_ar: s.hero_description_ar || '',
            hero_image: (s.hero_image && s.hero_image !== 'prodcut_home.jpg') ? s.hero_image : 'home_banner.png',
            section_eyebrow: s.section_eyebrow || 'OUR PRODUCTS',
            section_eyebrow_ar: s.section_eyebrow_ar || 'منتجاتنا الدوائية'
          };

          this.ctaForm = {
            cta_badge: s.cta_badge || 'STRATEGIC COLLABORATION',
            cta_badge_ar: s.cta_badge_ar || 'شراكة استراتيجية',
            cta_title_part1: s.cta_title_part1 || 'Building a Healthier Future, ',
            cta_title_part1_ar: s.cta_title_part1_ar || 'نبني مستقبلاً أكثر صحة، ',
            cta_title_accent: s.cta_title_accent || 'Together.',
            cta_title_accent_ar: s.cta_title_accent_ar || 'معاً.',
            cta_description: s.cta_description || '',
            cta_description_ar: s.cta_description_ar || '',
            cta_btn_text: s.cta_btn_text || 'Explore Partnerships',
            cta_btn_text_ar: s.cta_btn_text_ar || 'استكشف شراكاتنا',
            cta_link: s.cta_link || '/partners'
          };

          this.pageResources.set(s.page_resources || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  switchTab(tab: 'catalog' | 'hero' | 'resources' | 'cta'): void {
    this.activeTab.set(tab);
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // ==========================================
  // IMAGE RESOLVER
  // ==========================================
  resolveImg(src: string | undefined): string {
    return resolveImageUrl(src, 'flucelvax_featured.png');
  }

  // ==========================================
  // PRODUCT MODAL (ADD / EDIT)
  // ==========================================
  openAddProductModal(): void {
    this.isEditingProduct.set(false);
    this.currentProductId.set(null);
    this.productFormLang.set('en');
    this.activeFormSubTab.set('basic');
    this.productImages.set([{
      id: `img-${Date.now()}`,
      url: this.resolveImg('flucelvax_featured.png'),
      path: 'flucelvax_featured.png',
      isCover: true,
      isPackshot: true
    }]);
    this.newImageUrlInput = '';

    this.productForm = {
      product_code: '',
      category: 'our-products',
      name: '',
      name_ar: '',
      subtitle: '',
      subtitle_ar: '',
      image: 'flucelvax_featured.png',
      featured_image: 'flucelvax_featured.png',
      description: '',
      description_ar: '',
      features: [],
      features_ar: [],
      specs: [
        { label: 'Product Name', value: '' },
        { label: 'Type', value: '' },
        { label: 'Technology', value: '' },
        { label: 'Formulation', value: '' },
        { label: 'Pack Size', value: '' },
        { label: 'Route of Administration', value: '' },
        { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
      ],
      specs_ar: [
        { label: 'اسم المنتج الدوائي', value: '' },
        { label: 'نوع اللقاح', value: '' },
        { label: 'التقنية الحيوية', value: '' },
        { label: 'الشكل الصيدلاني', value: '' },
        { label: 'حجم العبوة', value: '' },
        { label: 'طريقة الإعطاء', value: '' },
        { label: 'جهة التصنيع', value: 'شركة اللقاحات الصناعية (VIC)' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: '24 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      storage_ar: [
        { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
        { label: 'عدم التجميد', value: 'نعم، يمنع التجميد' },
        { label: 'مدة الصلاحية', value: '24 شهراً' },
        { label: 'الحماية من الضوء', value: 'نعم' }
      ],
      indication_desc: '',
      indication_desc_ar: '',
      indication_target: '',
      indication_target_ar: '',
      indication_route: '',
      indication_route_ar: '',
      indication_items: [],
      indication_items_ar: [],
      gallery: ['flucelvax_featured.png'],
      resources: [
        { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
        { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' }
      ],
      resources_ar: [
        { name: 'معلومات المنتج الدوائي', type: 'PDF', size: '1.2 MB', icon: 'document' },
        { name: 'دليل الوصفات الطبية المعتمد', type: 'PDF', size: '1.5 MB', icon: 'prescribing' }
      ],
      order_index: this.products().length,
      status: 'Active'
    };

    this.isProductModalOpen.set(true);
  }

  openEditProductModal(product: Product): void {
    this.isEditingProduct.set(true);
    this.currentProductId.set(product.id);
    this.productFormLang.set('en');
    this.activeFormSubTab.set('basic');

    const list: ProductImageItem[] = [];
    const featured = product.featured_image || product.image || 'flucelvax_featured.png';
    const packshot = product.image || featured;
    const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [featured];

    const allUnique = Array.from(new Set([featured, packshot, ...gallery])).filter(Boolean);
    allUnique.forEach((p, idx) => {
      list.push({
        id: `existing-${idx}-${p}`,
        url: this.resolveImg(p),
        path: p,
        isCover: p === featured,
        isPackshot: p === packshot
      });
    });

    if (list.length > 0 && !list.some(img => img.isCover)) {
      list[0].isCover = true;
    }
    if (list.length > 0 && !list.some(img => img.isPackshot)) {
      list[0].isPackshot = true;
    }

    this.productImages.set(list);
    this.newImageUrlInput = '';

    this.productForm = {
      product_code: product.product_code || '',
      category: product.category || 'our-products',
      name: product.name || '',
      name_ar: product.name_ar || '',
      subtitle: product.subtitle || '',
      subtitle_ar: product.subtitle_ar || '',
      image: product.image || 'flucelvax_featured.png',
      featured_image: product.featured_image || product.image || 'flucelvax_featured.png',
      description: product.description || '',
      description_ar: product.description_ar || '',
      features: [...(product.features || [])],
      features_ar: [...(product.features_ar || [])],
      specs: (product.specs || []).map(s => ({ ...s })),
      specs_ar: (product.specs_ar || []).map(s => ({ ...s })),
      storage: (product.storage || []).map(s => ({ ...s })),
      storage_ar: (product.storage_ar || []).map(s => ({ ...s })),
      indication_desc: product.indication_desc || '',
      indication_desc_ar: product.indication_desc_ar || '',
      indication_target: product.indication_target || '',
      indication_target_ar: product.indication_target_ar || '',
      indication_route: product.indication_route || '',
      indication_route_ar: product.indication_route_ar || '',
      indication_items: (product.indication_items || []).map(i => ({ ...i })),
      indication_items_ar: (product.indication_items_ar || []).map(i => ({ ...i })),
      gallery: [...(product.gallery || [])],
      resources: (product.resources || []).map(r => ({ ...r })),
      resources_ar: (product.resources_ar || []).map(r => ({ ...r })),
      order_index: product.order_index !== undefined ? product.order_index : 0,
      status: product.status || 'Active'
    };

    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
    this.currentProductId.set(null);
  }

  onMasterImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const currentList = [...this.productImages()];
    const hadOnlyDefault = currentList.length === 1 && currentList[0].path === 'flucelvax_featured.png' && !currentList[0].file;
    const baseList = hadOnlyDefault ? [] : currentList;

    Array.from(files).forEach((file, fIdx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const previewUrl = reader.result as string;
        const newItem: ProductImageItem = {
          id: `upload-${Date.now()}-${fIdx}-${file.name}`,
          url: previewUrl,
          path: file.name,
          file: file,
          isCover: baseList.length === 0 && fIdx === 0,
          isPackshot: baseList.length === 0 && fIdx === 0
        };
        baseList.push(newItem);

        if (!baseList.some(img => img.isCover)) {
          baseList[0].isCover = true;
        }
        if (!baseList.some(img => img.isPackshot)) {
          baseList[0].isPackshot = true;
        }

        this.productImages.set([...baseList]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  setCoverImageItem(index: number): void {
    const list = this.productImages().map((img, idx) => ({
      ...img,
      isCover: idx === index
    }));
    this.productImages.set(list);
  }

  setPackshotImageItem(index: number): void {
    const list = this.productImages().map((img, idx) => ({
      ...img,
      isPackshot: idx === index
    }));
    this.productImages.set(list);
  }

  setAsBothCoverAndPackshot(index: number): void {
    const list = this.productImages().map((img, idx) => ({
      ...img,
      isCover: idx === index,
      isPackshot: idx === index
    }));
    this.productImages.set(list);
  }

  removeImageItem(index: number): void {
    const list = this.productImages().filter((_, idx) => idx !== index);
    if (list.length > 0 && !list.some(img => img.isCover)) {
      list[0].isCover = true;
    }
    if (list.length > 0 && !list.some(img => img.isPackshot)) {
      list[0].isPackshot = true;
    }
    this.productImages.set(list);
  }

  addImageByPath(): void {
    if (!this.newImageUrlInput.trim()) return;
    const path = this.newImageUrlInput.trim();
    const list = [...this.productImages()];
    list.push({
      id: `manual-${Date.now()}`,
      url: this.resolveImg(path),
      path: path,
      isCover: list.length === 0,
      isPackshot: list.length === 0
    });
    this.productImages.set(list);
    this.newImageUrlInput = '';
  }

  saveProduct(): void {
    if (!this.productForm.name) {
      this.errorMessage.set('Product English Name is required.');
      return;
    }

    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('product_code', this.productForm.product_code);
    formData.append('category', this.productForm.category);
    formData.append('name', this.productForm.name);
    formData.append('name_ar', this.productForm.name_ar || this.productForm.name);
    formData.append('subtitle', this.productForm.subtitle);
    formData.append('subtitle_ar', this.productForm.subtitle_ar || this.productForm.subtitle);
    formData.append('description', this.productForm.description);
    formData.append('description_ar', this.productForm.description_ar);
    formData.append('features', JSON.stringify(this.productForm.features));
    formData.append('features_ar', JSON.stringify(this.productForm.features_ar));
    formData.append('specs', JSON.stringify(this.productForm.specs));
    formData.append('specs_ar', JSON.stringify(this.productForm.specs_ar));
    formData.append('storage', JSON.stringify(this.productForm.storage));
    formData.append('storage_ar', JSON.stringify(this.productForm.storage_ar));
    formData.append('indication_desc', this.productForm.indication_desc);
    formData.append('indication_desc_ar', this.productForm.indication_desc_ar);
    formData.append('indication_target', this.productForm.indication_target);
    formData.append('indication_target_ar', this.productForm.indication_target_ar);
    formData.append('indication_route', this.productForm.indication_route);
    formData.append('indication_route_ar', this.productForm.indication_route_ar);
    formData.append('indication_items', JSON.stringify(this.productForm.indication_items));
    formData.append('indication_items_ar', JSON.stringify(this.productForm.indication_items_ar));
    formData.append('resources', JSON.stringify(this.productForm.resources));
    formData.append('resources_ar', JSON.stringify(this.productForm.resources_ar));
    formData.append('order_index', String(this.productForm.order_index));
    formData.append('status', this.productForm.status);

    // ==========================================
    // UNIFIED IMAGE & COVER HANDLING
    // ==========================================
    const images = this.productImages();
    const coverItem = images.find(img => img.isCover) || images[0];
    const packshotItem = images.find(img => img.isPackshot) || coverItem || images[0];

    // 1. Cover Image (Landing Showcase Carousel)
    if (coverItem && coverItem.file) {
      formData.append('featured_image', coverItem.file);
    } else if (coverItem) {
      formData.append('featured_image', coverItem.path);
    }

    // 2. Packshot / Primary Thumbnail (Catalog & Mobile)
    if (packshotItem && packshotItem.file) {
      if (coverItem && coverItem.file === packshotItem.file) {
        formData.append('image', packshotItem.file);
        formData.append('sync_featured', 'true');
      } else {
        formData.append('image', packshotItem.file);
      }
    } else if (packshotItem) {
      formData.append('image', packshotItem.path);
    }

    // 3. Any additional uploaded gallery files
    const extraFiles = images.filter(img => img.file && img !== coverItem && img !== packshotItem);
    extraFiles.forEach(img => {
      if (img.file) formData.append('gallery_files', img.file);
    });

    // 4. Send existing/named gallery paths
    const existingPaths = images
      .filter(img => !img.file || !img.path.startsWith('data:'))
      .map(img => img.path);
    formData.append('gallery', JSON.stringify(existingPaths));

    const id = this.currentProductId();
    if (this.isEditingProduct() && id) {
      this.productService.updateProduct(id, formData).subscribe({
        next: res => {
          this.isSaving.set(false);
          if (res && res.success) {
            this.successMessage.set(`Product "${res.product.name}" updated successfully.`);
            this.products.update(list => list.map(p => p.id === id ? res.product : p));
            this.closeProductModal();
          }
        },
        error: err => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update product.');
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: res => {
          this.isSaving.set(false);
          if (res && res.success) {
            this.successMessage.set(`Product "${res.product.name}" created successfully.`);
            this.products.update(list => [...list, res.product]);
            this.closeProductModal();
          }
        },
        error: err => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create product.');
        }
      });
    }
  }

  // ==========================================
  // DYNAMIC BULLET FEATURES HELPERS
  // ==========================================
  addFeatureEn(): void {
    if (this.newFeatureEn.trim()) {
      this.productForm.features.push(this.newFeatureEn.trim());
      this.newFeatureEn = '';
    }
  }

  removeFeatureEn(idx: number): void {
    this.productForm.features.splice(idx, 1);
  }

  addFeatureAr(): void {
    if (this.newFeatureAr.trim()) {
      this.productForm.features_ar.push(this.newFeatureAr.trim());
      this.newFeatureAr = '';
    }
  }

  removeFeatureAr(idx: number): void {
    this.productForm.features_ar.splice(idx, 1);
  }

  // ==========================================
  // DYNAMIC SPECS HELPERS
  // ==========================================
  addSpecEn(): void {
    if (this.newSpecLabelEn.trim() && this.newSpecValEn.trim()) {
      this.productForm.specs.push({ label: this.newSpecLabelEn.trim(), value: this.newSpecValEn.trim() });
      this.newSpecLabelEn = '';
      this.newSpecValEn = '';
    }
  }

  removeSpecEn(idx: number): void {
    this.productForm.specs.splice(idx, 1);
  }

  addSpecAr(): void {
    if (this.newSpecLabelAr.trim() && this.newSpecValAr.trim()) {
      this.productForm.specs_ar.push({ label: this.newSpecLabelAr.trim(), value: this.newSpecValAr.trim() });
      this.newSpecLabelAr = '';
      this.newSpecValAr = '';
    }
  }

  removeSpecAr(idx: number): void {
    this.productForm.specs_ar.splice(idx, 1);
  }

  // ==========================================
  // DYNAMIC STORAGE HELPERS
  // ==========================================
  addStorageEn(): void {
    if (this.newStorageLabelEn.trim() && this.newStorageValEn.trim()) {
      this.productForm.storage.push({ label: this.newStorageLabelEn.trim(), value: this.newStorageValEn.trim() });
      this.newStorageLabelEn = '';
      this.newStorageValEn = '';
    }
  }

  removeStorageEn(idx: number): void {
    this.productForm.storage.splice(idx, 1);
  }

  addStorageAr(): void {
    if (this.newStorageLabelAr.trim() && this.newStorageValAr.trim()) {
      this.productForm.storage_ar.push({ label: this.newStorageLabelAr.trim(), value: this.newStorageValAr.trim() });
      this.newStorageLabelAr = '';
      this.newStorageValAr = '';
    }
  }

  removeStorageAr(idx: number): void {
    this.productForm.storage_ar.splice(idx, 1);
  }

  // ==========================================
  // DYNAMIC INDICATION ITEMS HELPERS
  // ==========================================
  addIndicationItemEn(): void {
    if (this.newIndicationLabelEn.trim() && this.newIndicationValEn.trim()) {
      if (!this.productForm.indication_items) this.productForm.indication_items = [];
      this.productForm.indication_items.push({ label: this.newIndicationLabelEn.trim(), value: this.newIndicationValEn.trim() });
      this.newIndicationLabelEn = '';
      this.newIndicationValEn = '';
    }
  }

  removeIndicationItemEn(idx: number): void {
    this.productForm.indication_items.splice(idx, 1);
  }

  addIndicationItemAr(): void {
    if (this.newIndicationLabelAr.trim() && this.newIndicationValAr.trim()) {
      if (!this.productForm.indication_items_ar) this.productForm.indication_items_ar = [];
      this.productForm.indication_items_ar.push({ label: this.newIndicationLabelAr.trim(), value: this.newIndicationValAr.trim() });
      this.newIndicationLabelAr = '';
      this.newIndicationValAr = '';
    }
  }

  removeIndicationItemAr(idx: number): void {
    this.productForm.indication_items_ar.splice(idx, 1);
  }

  // ==========================================
  // DYNAMIC GALLERY HELPERS
  // ==========================================
  addGalleryImage(): void {
    if (this.newGalleryImageUrl.trim()) {
      this.productForm.gallery.push(this.newGalleryImageUrl.trim());
      this.newGalleryImageUrl = '';
    }
  }

  removeGalleryImage(idx: number): void {
    this.productForm.gallery.splice(idx, 1);
  }

  // ==========================================
  // DYNAMIC PRODUCT RESOURCES HELPERS
  // ==========================================
  addProductResource(): void {
    if (this.newResourceNameEn.trim()) {
      this.productForm.resources.push({
        name: this.newResourceNameEn.trim(),
        name_ar: this.newResourceNameAr.trim() || this.newResourceNameEn.trim(),
        type: this.newResourceType,
        size: this.newResourceSize,
        icon: this.newResourceIcon
      });
      if (this.newResourceNameAr.trim()) {
        this.productForm.resources_ar.push({
          name: this.newResourceNameAr.trim(),
          name_ar: this.newResourceNameAr.trim(),
          type: this.newResourceType,
          size: this.newResourceSize,
          icon: this.newResourceIcon
        });
      }
      this.newResourceNameEn = '';
      this.newResourceNameAr = '';
    }
  }

  removeProductResource(idx: number): void {
    this.productForm.resources.splice(idx, 1);
    if (this.productForm.resources_ar[idx]) {
      this.productForm.resources_ar.splice(idx, 1);
    }
  }

  // ==========================================
  // TOGGLE STATUS & REORDERING
  // ==========================================
  toggleProductStatus(product: Product): void {
    const newStatus: 'Active' | 'Inactive' = product.status === 'Active' ? 'Inactive' : 'Active';
    const formData = new FormData();
    formData.append('status', newStatus);

    this.productService.updateProduct(product.id, formData).subscribe({
      next: res => {
        if (res && res.success) {
          this.products.update(list =>
            list.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
          );
        }
      }
    });
  }

  moveProduct(product: Product, direction: 'up' | 'down'): void {
    const list = [...this.products()];
    const idx = list.findIndex(p => p.id === product.id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    } else {
      return;
    }

    const items = list.map((p, i) => ({ id: p.id, order_index: i }));
    list.forEach((p, i) => p.order_index = i);
    this.products.set(list);

    this.productService.reorderProducts(items).subscribe({
      error: () => this.loadAllData()
    });
  }

  // ==========================================
  // DELETE PRODUCT
  // ==========================================
  openDeleteModal(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.productToDelete.set(null);
  }

  confirmDelete(): void {
    const p = this.productToDelete();
    if (!p) return;

    this.productService.deleteProduct(p.id).subscribe({
      next: res => {
        if (res && res.success) {
          this.successMessage.set(`Product "${p.name}" deleted successfully.`);
          this.products.update(list => list.filter(item => item.id !== p.id));
          this.closeDeleteModal();
        }
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete product.');
      }
    });
  }

  // ==========================================
  // LIVE PREVIEW MODAL
  // ==========================================
  openLivePreview(product: Product): void {
    this.previewProduct.set(product);
    this.previewLang.set('en');
    this.previewViewMode.set('card');
    this.previewActiveTab.set('Overview');
    this.previewThumbnailIdx.set(0);
    this.isPreviewModalOpen.set(true);
  }

  closeLivePreview(): void {
    this.isPreviewModalOpen.set(false);
    this.previewProduct.set(null);
  }

  getPreviewName(product: Product): string {
    return this.previewLang() === 'ar' && product.name_ar ? product.name_ar : product.name;
  }

  getPreviewSubtitle(product: Product): string {
    return this.previewLang() === 'ar' && product.subtitle_ar ? product.subtitle_ar : product.subtitle;
  }

  getPreviewDescription(product: Product): string {
    return this.previewLang() === 'ar' && product.description_ar ? product.description_ar : product.description;
  }

  getPreviewFeatures(product: Product): string[] {
    if (this.previewLang() === 'ar' && product.features_ar && product.features_ar.length > 0) {
      return product.features_ar;
    }
    return product.features || [];
  }

  getPreviewSpecs(product: Product): ProductSpecItem[] {
    if (this.previewLang() === 'ar' && product.specs_ar && product.specs_ar.length > 0) {
      return product.specs_ar;
    }
    return product.specs || [];
  }

  getPreviewStorage(product: Product): ProductSpecItem[] {
    if (this.previewLang() === 'ar' && product.storage_ar && product.storage_ar.length > 0) {
      return product.storage_ar;
    }
    return product.storage || [];
  }

  getPreviewResources(product: Product): ProductResourceItem[] {
    if (this.previewLang() === 'ar' && product.resources_ar && product.resources_ar.length > 0) {
      return product.resources_ar;
    }
    return product.resources || [];
  }

  getPreviewIndicationDesc(product: Product): string {
    if (this.previewLang() === 'ar') {
      return product.indication_desc_ar || 'مخصص للتحصين الفعال وفق اللوائح المعتمدة من وزارة الصحة.';
    }
    return product.indication_desc || 'is indicated for active immunization against targeted pathogens.';
  }

  getPreviewIndicationTarget(product: Product): string {
    if (this.previewLang() === 'ar') {
      return product.indication_target_ar || 'الأفراد من سن 6 أشهر فما فوق وعامة أفراد المجتمع';
    }
    return product.indication_target || 'Individuals 6 months and older / High-risk populations';
  }

  getPreviewIndicationRoute(product: Product): string {
    if (this.previewLang() === 'ar') {
      return product.indication_route_ar || 'عن طريق الحقن العضلي بإشراف ممارسين صحيين معتمدين';
    }
    return product.indication_route || 'Administered via intramuscular injection by healthcare professionals';
  }

  getPreviewIndicationItems(product: Product): ProductSpecItem[] {
    if (this.previewLang() === 'ar' && product.indication_items_ar && product.indication_items_ar.length > 0) {
      return product.indication_items_ar;
    }
    return product.indication_items || [];
  }

  // ==========================================
  // PAGE SETTINGS (HERO & CTA) SAVING
  // ==========================================
  onHeroImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.heroImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.heroImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveHeroSettings(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('hero_badge', this.heroForm.hero_badge);
    formData.append('hero_badge_ar', this.heroForm.hero_badge_ar);
    formData.append('hero_title_part1', this.heroForm.hero_title_part1);
    formData.append('hero_title_part1_ar', this.heroForm.hero_title_part1_ar);
    formData.append('hero_title_part2', this.heroForm.hero_title_part2);
    formData.append('hero_title_part2_ar', this.heroForm.hero_title_part2_ar);
    formData.append('hero_title_accent', this.heroForm.hero_title_accent);
    formData.append('hero_title_accent_ar', this.heroForm.hero_title_accent_ar);
    formData.append('hero_description', this.heroForm.hero_description);
    formData.append('hero_description_ar', this.heroForm.hero_description_ar);
    formData.append('section_eyebrow', this.heroForm.section_eyebrow);
    formData.append('section_eyebrow_ar', this.heroForm.section_eyebrow_ar);
    formData.append('hero_image', this.heroForm.hero_image);

    if (this.heroImageFile) {
      formData.append('hero_image', this.heroImageFile);
    }

    this.productService.updatePageSettings(formData).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (res && res.success) {
          this.successMessage.set('Hero banner and section configuration updated successfully.');
          this.pageSettings.set(res.settings);
        }
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update hero settings.');
      }
    });
  }

  saveCtaSettings(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('cta_badge', this.ctaForm.cta_badge);
    formData.append('cta_badge_ar', this.ctaForm.cta_badge_ar);
    formData.append('cta_title_part1', this.ctaForm.cta_title_part1);
    formData.append('cta_title_part1_ar', this.ctaForm.cta_title_part1_ar);
    formData.append('cta_title_accent', this.ctaForm.cta_title_accent);
    formData.append('cta_title_accent_ar', this.ctaForm.cta_title_accent_ar);
    formData.append('cta_description', this.ctaForm.cta_description);
    formData.append('cta_description_ar', this.ctaForm.cta_description_ar);
    formData.append('cta_btn_text', this.ctaForm.cta_btn_text);
    formData.append('cta_btn_text_ar', this.ctaForm.cta_btn_text_ar);
    formData.append('cta_link', this.ctaForm.cta_link);

    this.productService.updatePageSettings(formData).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (res && res.success) {
          this.successMessage.set('Partnerships CTA banner updated successfully.');
          this.pageSettings.set(res.settings);
        }
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update CTA settings.');
      }
    });
  }

  // ==========================================
  // PAGE-LEVEL RESOURCES
  // ==========================================
  addPageResource(): void {
    if (this.newPageResName.trim()) {
      const updated = [
        ...this.pageResources(),
        {
          name: this.newPageResName.trim(),
          name_ar: this.newPageResNameAr.trim() || this.newPageResName.trim(),
          type: this.newPageResType,
          size: this.newPageResSize,
          icon: this.newPageResIcon
        }
      ];
      this.pageResources.set(updated);
      this.newPageResName = '';
      this.newPageResNameAr = '';

      this.savePageResources(updated);
    }
  }

  removePageResource(index: number): void {
    const updated = this.pageResources().filter((_, i) => i !== index);
    this.pageResources.set(updated);
    this.savePageResources(updated);
  }

  private savePageResources(resources: ProductResourceItem[]): void {
    this.isSaving.set(true);
    const formData = new FormData();
    formData.append('page_resources', JSON.stringify(resources));

    this.productService.updatePageSettings(formData).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (res && res.success) {
          this.successMessage.set('Resources & Downloads updated successfully.');
        }
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to save resources.');
      }
    });
  }

  // ==========================================
  // RESTORE OFFICIAL DEFAULTS
  // ==========================================
  restoreDefaults(): void {
    if (!confirm('Are you sure you want to restore official default products, specifications, and Saudi Arabic translations? Any unsaved modifications will be reset.')) {
      return;
    }

    this.isSyncing.set(true);
    this.clearAlerts();

    this.productService.seedDefaults().subscribe({
      next: res => {
        this.isSyncing.set(false);
        if (res && res.success) {
          this.successMessage.set('Official product portfolio and settings restored successfully.');
          this.loadAllData();
        }
      },
      error: err => {
        this.isSyncing.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to restore defaults.');
      }
    });
  }
}
