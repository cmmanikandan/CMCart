/**
 * CMCart Supabase PostgreSQL Client & Reactive Data Store
 * Provides seamless PostgreSQL interface with resilient localStorage caching.
 * No mock/seed data — starts with empty store until real data is uploaded or created.
 */

import { supabase } from './supabaseInit';

const STORAGE_KEY = 'cmcart_commerce_store_v3';
const REGISTRY_KEY = 'cmcart_datasets_registry_v1';
const MIGRATION_KEY = 'cmcart_v4_migrated';

// One-time migration: remove the old auto-seeded 'built-in-temp' entry
// so the dataset manager shows correct empty state on first load after this update.
if (!localStorage.getItem(MIGRATION_KEY)) {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) {
      let reg = JSON.parse(raw);
      reg = reg.filter(d => d.id !== 'built-in-temp' && !d.isTemporary);
      // If all removed, clear overlay flag too
      if (reg.length === 0) {
        localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'false');
        // Reset store to empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          products: [], categories: [], banners: [], coupons: [], orders: [],
          addresses: [], reviews: [], notifications: [], homepage_sections: [],
          deals: [], campaigns: [], customers: []
        }));
      } else {
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
      }
    } else {
      // No registry — ensure overlay is off and store is empty
      localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'false');
    }
  } catch (e) { /* ignore */ }
  localStorage.setItem(MIGRATION_KEY, '1');
}

const INITIAL_HOMEPAGE_SECTIONS = [
  {
    id: 'sec-hero',
    title: 'Hero Banner Carousel',
    subtitle: 'Top promotional slides & seasonal spotlights',
    section_type: 'hero_banner',
    display_order: 1,
    status: 'active',
    layout: 'carousel',
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-deals',
    title: 'Deals of the Day',
    subtitle: 'Unbeatable discounts up to 60% off',
    section_type: 'deals',
    display_order: 2,
    status: 'active',
    layout: 'carousel',
    deal_id: null,
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-categories',
    title: 'Explore Popular Categories',
    subtitle: 'Shop by your favorite departments',
    section_type: 'categories',
    display_order: 3,
    status: 'active',
    layout: 'horizontal_scroll',
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-bestsellers',
    title: 'Best Sellers',
    subtitle: 'Most loved products by verified shoppers',
    section_type: 'best_sellers',
    display_order: 4,
    status: 'active',
    layout: 'grid',
    config: { mode: 'automatic', salesPeriod: '30d', limit: 8 },
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-banner-promo',
    title: 'Promotional Banner',
    subtitle: 'Featured store-wide promotional banner',
    section_type: 'banner_promo',
    display_order: 5,
    status: 'active',
    layout: 'banner',
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-newarrivals',
    title: 'Fresh New Arrivals',
    subtitle: 'Latest tech, trending fits and accessories',
    section_type: 'new_arrivals',
    display_order: 6,
    status: 'active',
    layout: 'grid',
    config: { mode: 'automatic', limit: 8 },
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-coupons',
    title: 'Offers & Coupons',
    subtitle: 'Claim exclusive bank discounts and vouchers',
    section_type: 'coupons',
    display_order: 7,
    status: 'active',
    layout: 'grid',
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'sec-recommended',
    title: 'Recommended For You',
    subtitle: 'Curated based on your browsing taste',
    section_type: 'recommended',
    display_order: 8,
    status: 'active',
    layout: 'grid',
    start_at: null,
    end_at: null,
    created_at: new Date().toISOString()
  }
];

// Empty initial store — no mock data
const EMPTY_STORE = {
  products: [],
  categories: [],
  banners: [],
  coupons: [],
  orders: [],
  addresses: [],
  reviews: [],
  notifications: [],
  homepage_sections: INITIAL_HOMEPAGE_SECTIONS,
  deals: [],
  campaigns: [],
  customers: []
};

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let needsSave = false;
      if (!parsed.homepage_sections) {
        parsed.homepage_sections = INITIAL_HOMEPAGE_SECTIONS;
        needsSave = true;
      }
      if (!parsed.deals) {
        parsed.deals = [];
        needsSave = true;
      }
      if (!parsed.campaigns) {
        parsed.campaigns = [];
        needsSave = true;
      }
      if (!parsed.customers) {
        parsed.customers = [];
        needsSave = true;
      }
      if (needsSave) {
        saveStore(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed reading store from localStorage', e);
  }

  // First time visit — start with empty store, no mock data
  const initial = { ...EMPTY_STORE };
  saveStore(initial);
  return initial;
}

function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed saving store', e);
  }
}

function isStoreAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const uid = user.uid || user.id;
  const email = (user.email || '').toLowerCase().trim();
  if (uid === '4nEoHgT24ofMMkvhZJdCbOMjJmy1') return true;
  if (email === 'admin@cmcart.com' || email === 'manikandanprabhu37@gmail.com' || email.endsWith('@admin.cmcart.com')) return true;
  return false;
}

function getCurrentAuthUser() {
  try {
    const raw = localStorage.getItem('cmcart_auth_user_v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isStoreAdmin(parsed)) {
      parsed.role = 'admin';
    }
    return parsed;
  } catch {
    return null;
  }
}

let isCatalogSyncing = false;
let hasSyncedCatalog = false;

export async function syncCatalogFromCloud() {
  if (isCatalogSyncing) return;
  isCatalogSyncing = true;
  try {
    const store = getStore();
    let modified = false;

    // 1. Fetch live products, categories, and banners from Supabase PostgreSQL
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        const { data: sbProds } = await supabase.from('products').select('*');
        if (Array.isArray(sbProds) && sbProds.length > 0) {
          sbProds.forEach((sbP) => {
            const idx = store.products.findIndex((p) => p.id === sbP.id || p.slug === sbP.slug);
            if (idx === -1) {
              store.products.push(sbP);
              modified = true;
            } else {
              store.products[idx] = { ...store.products[idx], ...sbP };
              modified = true;
            }
          });
        }

        const { data: sbCats } = await supabase.from('categories').select('*');
        if (Array.isArray(sbCats) && sbCats.length > 0) {
          sbCats.forEach((sbC) => {
            const idx = store.categories.findIndex((c) => c.id === sbC.id || c.slug === sbC.slug);
            if (idx === -1) {
              store.categories.push(sbC);
              modified = true;
            }
          });
        }

        const { data: sbBans } = await supabase.from('banners').select('*');
        if (Array.isArray(sbBans) && sbBans.length > 0) {
          sbBans.forEach((sbB) => {
            const idx = store.banners.findIndex((b) => b.id === sbB.id);
            if (idx === -1) {
              store.banners.push(sbB);
              modified = true;
            }
          });
        }
      }
    } catch (sbErr) {
      console.warn('Supabase catalog fetch note:', sbErr?.message);
    }

    // 2. Fetch live products from Cloudinary resilient cloud database
    try {
      const { fetchCatalogFromCloud } = await import('../cloud/cloudSyncService');
      const cloud = await fetchCatalogFromCloud();
      if (cloud) {
        if (Array.isArray(cloud.products) && cloud.products.length > 0) {
          cloud.products.forEach((cP) => {
            const idx = store.products.findIndex((p) => p.id === cP.id || p.slug === cP.slug);
            if (idx === -1) {
              store.products.push(cP);
              modified = true;
            }
          });
        }
        if (Array.isArray(cloud.categories) && cloud.categories.length > 0) {
          cloud.categories.forEach((cC) => {
            const idx = store.categories.findIndex((c) => c.id === cC.id || c.slug === cC.slug);
            if (idx === -1) {
              store.categories.push(cC);
              modified = true;
            }
          });
        }
        if (Array.isArray(cloud.banners) && cloud.banners.length > 0) {
          cloud.banners.forEach((cB) => {
            const idx = store.banners.findIndex((b) => b.id === cB.id);
            if (idx === -1) {
              store.banners.push(cB);
              modified = true;
            }
          });
        }
      }
    } catch (cErr) {
      console.warn('Cloud catalog fetch note:', cErr?.message);
    }

    if (modified) {
      saveStore(store);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cmcart_dataset_updated'));
      }
    }
  } finally {
    isCatalogSyncing = false;
    hasSyncedCatalog = true;
  }
}

// Auto-trigger background catalog sync on startup
if (typeof window !== 'undefined') {
  setTimeout(() => syncCatalogFromCloud(), 150);
}

// Commerce Service API
export const commerceDb = {
  // PRODUCTS
  async getProducts(params = {}) {
    let store = getStore();
    if (store.products.length === 0 && !hasSyncedCatalog) {
      await syncCatalogFromCloud();
      store = getStore();
    }
    let items = [...store.products];

    if (params.category) {
      items = items.filter(p => p.category_id === params.category || p.category_name?.toLowerCase() === params.category.toLowerCase());
    }
    if (params.brand) {
      items = items.filter(p => p.brand.toLowerCase() === params.brand.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (params.filter === 'deals') {
      items = items.filter(p => p.is_deal_of_the_day || p.discount_percentage >= 20);
    }
    if (params.filter === 'bestsellers') {
      items = items.filter(p => p.is_best_seller);
    }
    if (params.filter === 'new') {
      items = items.filter(p => p.is_new_arrival);
    }
    if (params.minPrice) {
      items = items.filter(p => p.current_price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      items = items.filter(p => p.current_price <= Number(params.maxPrice));
    }
    if (params.rating) {
      items = items.filter(p => p.rating >= Number(params.rating));
    }

    // Sorting
    if (params.sort === 'price_asc') {
      items.sort((a, b) => a.current_price - b.current_price);
    } else if (params.sort === 'price_desc') {
      items.sort((a, b) => b.current_price - a.current_price);
    } else if (params.sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (params.sort === 'discount') {
      items.sort((a, b) => b.discount_percentage - a.discount_percentage);
    }

    return items;
  },

  async getProductById(id) {
    const store = getStore();
    return store.products.find(p => p.id === id || p.slug === id) || null;
  },

  async addProduct(product) {
    const store = getStore();
    const cleanId = (product.id && product.id.length === 36)
      ? product.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod-${Date.now()}`);

    const newProduct = {
      id: cleanId,
      slug: (product.slug || product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      rating: Number(product.rating || 5.0),
      review_count: Number(product.review_count || 0),
      is_active: product.is_active ?? true,
      ...product,
      id: cleanId,
      current_price: Number(product.current_price || 0),
      original_price: Number(product.original_price || product.current_price || 0),
      discount_percentage: Number(product.discount_percentage || (product.original_price && product.current_price ? Math.round(((Number(product.original_price) - Number(product.current_price)) / Number(product.original_price)) * 100) : 0)),
      images: product.images?.length ? product.images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: product.specifications || {},
      offers: product.offers || ['Flat 10% instant discount on bank cards']
    };
    store.products.unshift(newProduct);
    saveStore(store);

    // 1. Sync updated catalog to Cloudinary cloud (live across all devices)
    import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
      saveCatalogToCloud(store);
    }).catch(() => {});

    // 2. Also insert into Supabase PostgreSQL products table
    import('./supabaseInit').then(({ supabase }) => {
      if (supabase) {
        supabase.from('products').insert([{
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description || null,
          category_id: (newProduct.category_id && newProduct.category_id.length === 36) ? newProduct.category_id : null,
          category_name: newProduct.category_name || null,
          brand: newProduct.brand || null,
          sku: newProduct.sku || null,
          current_price: newProduct.current_price,
          original_price: newProduct.original_price,
          discount_percentage: newProduct.discount_percentage,
          stock: Number(newProduct.stock || 0),
          is_active: newProduct.is_active,
          images: newProduct.images || null,
          variants: newProduct.variants || null,
          specifications: newProduct.specifications || null,
          offers: newProduct.offers || null,
          updated_at: new Date().toISOString()
        }]).then(({ error }) => {
          if (error) console.warn('Supabase product insert note:', error.message);
        });
      }
    }).catch(() => {});

    return newProduct;
  },

  async updateProduct(id, updates) {
    const store = getStore();
    const idx = store.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      store.products[idx] = { ...store.products[idx], ...updates };
      saveStore(store);

      // Cloud catalog sync
      import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
        saveCatalogToCloud(store);
      }).catch(() => {});

      // Supabase PostgreSQL update
      import('./supabaseInit').then(({ supabase }) => {
        if (supabase) {
          supabase.from('products').update({
            ...updates,
            updated_at: new Date().toISOString()
          }).eq('id', id).then(({ error }) => {
            if (error) console.warn('Supabase product update note:', error.message);
          });
        }
      }).catch(() => {});

      return store.products[idx];
    }
    return null;
  },

  async deleteProduct(id) {
    const store = getStore();
    store.products = store.products.filter(p => p.id !== id);
    saveStore(store);

    // Cloud catalog sync
    import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
      saveCatalogToCloud(store);
    }).catch(() => {});

    // Supabase PostgreSQL delete
    import('./supabaseInit').then(({ supabase }) => {
      if (supabase) {
        supabase.from('products').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase product delete note:', error.message);
        });
      }
    }).catch(() => {});

    return true;
  },

  // CATEGORIES
  async getCategories() {
    let store = getStore();
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        const { data: dbCats } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
        if (Array.isArray(dbCats) && dbCats.length > 0) {
          store.categories = dbCats;
          saveStore(store);
          return dbCats;
        }
      }
    } catch (e) { /* ignore */ }
    return store.categories;
  },

  async addCategory(cat) {
    const store = getStore();
    let createdCat = null;
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        const { data } = await supabase.from('categories').insert([{
          name: cat.name,
          slug: (cat.slug || cat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: cat.description || null,
          icon: cat.icon || null,
          image_url: cat.image_url || null,
          is_active: cat.is_active ?? true,
          updated_at: new Date().toISOString()
        }]).select().maybeSingle();
        createdCat = data;
      }
    } catch (e) { /* ignore */ }

    const newCat = createdCat || {
      id: `cat-${Date.now()}`,
      slug: (cat.slug || cat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      itemCount: 0,
      is_active: true,
      ...cat
    };

    const exists = store.categories.some(c => c.id === newCat.id);
    if (!exists) {
      store.categories.push(newCat);
      saveStore(store);
    }

    import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
      saveCatalogToCloud(store);
    }).catch(() => {});

    return newCat;
  },

  async updateCategory(id, updates) {
    const store = getStore();
    const idx = store.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      store.categories[idx] = { ...store.categories[idx], ...updates };
      saveStore(store);
    }

    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        await supabase.from('categories').update({
          name: updates.name,
          slug: updates.slug,
          description: updates.description || null,
          icon: updates.icon || null,
          image_url: updates.image_url || null,
          is_active: updates.is_active ?? true,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      }
    } catch (e) { /* ignore */ }

    import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
      saveCatalogToCloud(store);
    }).catch(() => {});

    return store.categories[idx] || updates;
  },

  async deleteCategory(id) {
    const store = getStore();
    store.categories = store.categories.filter(c => c.id !== id);
    saveStore(store);

    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        await supabase.from('categories').delete().eq('id', id);
      }
    } catch (e) { /* ignore */ }

    import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
      saveCatalogToCloud(store);
    }).catch(() => {});

    return true;
  },

  // BANNERS
  async getBanners() {
    let store = getStore();
    if (store.banners.length === 0 && !hasSyncedCatalog) {
      await syncCatalogFromCloud();
      store = getStore();
    }
    return store.banners;
  },

  async addBanner(banner) {
    const store = getStore();
    const cleanId = (banner.id && banner.id.length === 36)
      ? banner.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ban-${Date.now()}`);

    const newBan = {
      id: cleanId,
      is_active: true,
      ...banner,
      id: cleanId
    };
    store.banners.push(newBan);
    saveStore(store);

    import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
      saveCatalogToCloud(store);
    }).catch(() => {});

    import('./supabaseInit').then(({ supabase }) => {
      if (supabase) {
        supabase.from('banners').insert([{
          id: newBan.id,
          title: newBan.title,
          subtitle: newBan.subtitle || null,
          image_url: newBan.image_url,
          link_url: newBan.link_url || null,
          badge_text: newBan.badge_text || null,
          is_active: newBan.is_active,
          updated_at: new Date().toISOString()
        }]).then(({ error }) => {
          if (error) console.warn('Supabase banner insert note:', error.message);
        });
      }
    }).catch(() => {});

    return newBan;
  },

  async updateBanner(id, updates) {
    const store = getStore();
    const idx = store.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      store.banners[idx] = { ...store.banners[idx], ...updates };
      saveStore(store);

      import('../cloud/cloudSyncService').then(({ saveCatalogToCloud }) => {
        saveCatalogToCloud(store);
      }).catch(() => {});

      import('./supabaseInit').then(({ supabase }) => {
        if (supabase) {
          supabase.from('banners').update({
            ...updates,
            updated_at: new Date().toISOString()
          }).eq('id', id).then(({ error }) => {
            if (error) console.warn('Supabase banner update note:', error.message);
          });
        }
      }).catch(() => {});

      return store.banners[idx];
    }
    return null;
  },

  async deleteBanner(id) {
    const store = getStore();
    store.banners = store.banners.filter(b => b.id !== id);
    saveStore(store);
    return true;
  },

  // ORDERS
  async getOrders(filterUser = null) {
    const store = getStore();
    const target = filterUser || getCurrentAuthUser();
    const uid = target?.uid || target?.id;
    const email = (target?.email || '').toLowerCase().trim();

    // Fetch live orders directly from Supabase PostgreSQL
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        const { data: dbOrders } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          dbOrders.forEach(dbo => {
            const exists = store.orders.some(o => o.id === dbo.id || o.order_number === dbo.order_number);
            const transformed = {
              ...dbo,
              items: Array.isArray(dbo.order_items) ? dbo.order_items.map(i => ({
                id: i.id,
                name: i.product_name,
                product_name: i.product_name,
                image: i.product_image,
                unit_price: Number(i.unit_price),
                quantity: Number(i.quantity),
                total: Number(i.total_price),
                selected_options: i.selected_options
              })) : (dbo.items || [])
            };
            if (!exists) {
              store.orders.unshift(transformed);
            }
          });
          saveStore(store);
        }
      }
    } catch (e) { /* ignore */ }

    if (filterUser === 'all' || filterUser?.all === true || ((target?.role === 'admin' || isStoreAdmin(target)) && !filterUser)) {
      return store.orders || [];
    }

    if (!target) return [];

    let matched = (store.orders || []).filter(o => {
      if (uid && o.user_id && o.user_id === uid) return true;
      if (email && o.user_email && o.user_email.toLowerCase() === email) return true;
      if (uid && o.shipping_address?.user_id && o.shipping_address.user_id === uid) return true;
      if (email && o.shipping_address?.user_email && o.shipping_address.user_email.toLowerCase() === email) return true;
      if (email && o.shipping_address?.email && o.shipping_address.email.toLowerCase() === email) return true;
      return false;
    });

    if (matched.length === 0 && uid) {
      try {
        const { fetchUserFromCloud } = await import('../cloud/cloudSyncService');
        const cloudData = await fetchUserFromCloud(uid);
        if (cloudData && Array.isArray(cloudData.orders) && cloudData.orders.length > 0) {
          commerceDb.hydrateUserData(cloudData.addresses, cloudData.orders);
          const reloaded = getStore();
          matched = (reloaded.orders || []).filter(o => {
            if (uid && o.user_id && o.user_id === uid) return true;
            if (email && o.user_email && o.user_email.toLowerCase() === email) return true;
            return false;
          });
        }
      } catch (e) { /* ignore */ }
    }

    return matched;
  },

  async getOrderById(id) {
    const store = getStore();
    let found = store.orders.find(o => o.id === id || o.order_number === id);

    // Also fetch fresh from Supabase PostgreSQL to ensure latest live status
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        const { data: dbo, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(`id.eq.${id},order_number.eq.${id}`)
          .maybeSingle();

        if (dbo && !error) {
          const transformed = {
            ...dbo,
            items: Array.isArray(dbo.order_items) && dbo.order_items.length > 0 ? dbo.order_items.map(i => ({
              id: i.id,
              name: i.product_name,
              product_name: i.product_name,
              image: i.product_image,
              unit_price: Number(i.unit_price),
              quantity: Number(i.quantity),
              total: Number(i.total_price),
              selected_options: i.selected_options
            })) : (dbo.items || found?.items || [])
          };

          const existIdx = store.orders.findIndex(o => o.id === dbo.id || o.order_number === dbo.order_number);
          if (existIdx !== -1) {
            store.orders[existIdx] = { ...store.orders[existIdx], ...transformed };
          } else {
            store.orders.unshift(transformed);
          }
          saveStore(store);
          return store.orders[existIdx !== -1 ? existIdx : 0];
        }
      }
    } catch (e) { /* ignore */ }

    return found || null;
  },

  async createOrder(orderPayload) {
    const store = getStore();
    const target = getCurrentAuthUser();
    const uid = orderPayload.user_id || target?.uid || null;
    const email = orderPayload.user_email || target?.email || null;

    const newOrder = {
      id: `ord-${Date.now().toString().slice(-5)}`,
      order_number: `CMC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      status: orderPayload.status || 'Confirmed',
      estimated_delivery: 'In 2-3 business days',
      tracking_number: `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      carrier: 'CMCart Express Logistics',
      user_id: uid,
      user_email: email,
      ...orderPayload,
      items: (orderPayload.items || []).map((item) => ({
        ...item,
        product_id: item.product_id || item.id,
        product_name_snapshot: item.product_name || item.name,
        variant_id: item.variant_id || item.variantId || 'var-default',
        variant_name_snapshot: item.variant || item.variant_name || 'Standard',
        sku: item.sku || `CMC-${item.product_id || 'PROD'}-STD`,
        selected_options: item.selected_options || {
          color: item.color || item.variantColor || null,
          size: item.size || item.variantSize || null,
          storage: item.storage || null
        },
        unit_price: Number(item.unit_price || item.current_price || item.price || 0),
        quantity: Number(item.quantity || 1),
        image: item.image || (item.images && item.images[0]) || ''
      })),
      timeline: [
        { status: 'Order Placed', time: 'Just now', completed: true, note: 'Payment confirmed & order accepted' },
        { status: 'Packed', time: 'Pending fulfillment', completed: false, note: 'Will be processed at nearest fulfillment hub' },
        { status: 'Shipped', time: 'Pending dispatch', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false }
      ]
    };
    store.orders.unshift(newOrder);

    // Also add an automated notification scoped to this user
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: uid,
      user_email: email,
      title: `Order Confirmed! (#${newOrder.order_number})`,
      message: `Your order for ₹${newOrder.total_amount.toLocaleString('en-IN')} has been placed successfully.`,
      time: 'Just now',
      type: 'order',
      link: `/order/${newOrder.id}`,
      is_read: false
    });

    saveStore(store);

    // 1. Insert directly into Supabase PostgreSQL orders and order_items tables
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        const { data: dbOrder, error: oErr } = await supabase.from('orders').insert([{
          order_number: newOrder.order_number,
          total_amount: Number(newOrder.total_amount || 0),
          subtotal: Number(newOrder.subtotal || newOrder.total_amount || 0),
          status: newOrder.status || 'Confirmed',
          payment_method: newOrder.payment_method || 'Cash on Delivery',
          payment_status: newOrder.payment_status || 'Pending',
          shipping_address: newOrder.shipping_address || {},
          timeline: newOrder.timeline || [],
          carrier: newOrder.carrier || 'CMCart Express Logistics',
          tracking_number: newOrder.tracking_number || null,
          estimated_delivery: newOrder.estimated_delivery || 'In 2-3 business days',
          is_paid: !!newOrder.is_paid,
          cod_collected: !!newOrder.cod_collected,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]).select().maybeSingle();

        if (oErr) {
          console.warn('Supabase live order insert note:', oErr.message);
        }

        if (dbOrder && Array.isArray(newOrder.items) && newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map(it => ({
            order_id: dbOrder.id,
            product_name: it.product_name_snapshot || it.name || 'Product',
            product_image: it.image || null,
            unit_price: Number(it.unit_price || 0),
            quantity: Number(it.quantity || 1),
            total_price: Number(it.unit_price || 0) * Number(it.quantity || 1),
            selected_options: it.selected_options || {}
          }));
          await supabase.from('order_items').insert(itemsPayload);
        }
      }
    } catch (dbErr) {
      console.warn('Supabase live order insert error:', dbErr?.message);
    }

    // 2. Sync order to cloud for cross-device access
    if (uid) {
      import('../cloud/cloudSyncService').then(({ saveUserToCloud }) => {
        const userOrders = store.orders.filter(o => o.user_id === uid || (o.user_email && o.user_email.toLowerCase() === (email || '').toLowerCase()));
        saveUserToCloud({ uid, email }, { orders: userOrders });
      }).catch(() => {});
    }

    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    const store = getStore();
    const order = store.orders.find(o => o.id === orderId || o.order_number === orderId);

    // Update timeline step completion
    const stepOrder = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIdx = stepOrder.indexOf(newStatus);

    let updatedTimeline = order?.timeline || [];
    if (!Array.isArray(updatedTimeline)) updatedTimeline = [];

    if (currentIdx !== -1) {
      updatedTimeline.forEach((step, idx) => {
        if (idx <= currentIdx) {
          step.completed = true;
          if (!step.time || step.time.includes('Pending')) {
            step.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      });
    }

    if (newStatus === 'Cancelled') {
      updatedTimeline.push({
        status: 'Cancelled',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        note: 'Order cancelled'
      });
    }

    if (order) {
      order.status = newStatus;
      order.timeline = updatedTimeline;
      order.updated_at = new Date().toISOString();
      saveStore(store);
    }

    // 1. Update Supabase PostgreSQL live
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        await supabase
          .from('orders')
          .update({
            status: newStatus,
            timeline: updatedTimeline,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`);
      }
    } catch (e) {
      console.warn('Supabase order status update note:', e?.message);
    }

    // 2. Broadcast via WebSocket, Supabase Channel, and Window Event
    import('../realtime/realtimeService').then(({ realtimeOrders }) => {
      realtimeOrders.broadcastStatusChange(orderId, newStatus, order);
    }).catch(() => {});

    // 3. Sync to user cloud backup
    if (order?.user_id) {
      import('../cloud/cloudSyncService').then(({ saveUserToCloud }) => {
        const userOrders = store.orders.filter(o => o.user_id === order.user_id);
        const addresses = store.addresses.filter(a => a.user_id === order.user_id);
        saveUserToCloud({ uid: order.user_id, orders: userOrders, addresses });
      }).catch(() => {});
    }

    return order;
  },

  async markPaymentCollected(orderId) {
    const store = getStore();
    const order = store.orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) return null;

    order.payment_status = 'Completed';
    order.is_paid = true;
    order.cod_collected = true;
    order.cod_collected_at = new Date().toISOString();

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: 'COD Payment Collected',
      time: 'Just now',
      completed: true,
      note: 'COD payment marked as collected by admin.'
    });

    saveStore(store);

    // Update Supabase PostgreSQL live
    try {
      const { supabase } = await import('./supabaseInit');
      if (supabase) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'Completed',
            is_paid: true,
            cod_collected: true,
            timeline: order.timeline,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`);
      }
    } catch (e) { /* ignore */ }

    // Broadcast via realtime
    import('../realtime/realtimeService').then(({ realtimeOrders }) => {
      realtimeOrders.broadcastStatusChange(orderId, order.status, order);
    }).catch(() => {});

    return order;
  },

  async getPayments() {
    const store = getStore();
    return store.orders.map((ord, idx) => {
      const isCod = ord.payment_method?.toLowerCase().includes('cash');
      const isPaid = ord.payment_status === 'Completed' || ord.cod_collected || (!isCod && !ord.payment_status?.toLowerCase().includes('fail'));
      const seed = ord.order_number?.replace(/\D/g, '') || String(idx + 1000);
      return {
        id: isCod ? `cod_${seed}` : `pay_rzp_${seed}`,
        orderId: ord.id,
        orderNumber: ord.order_number,
        customerName: ord.shipping_address?.full_name || 'Customer Shopper',
        customerPhone: ord.shipping_address?.phone || '+91 98765 43210',
        date: ord.date || new Date().toISOString(),
        amount: ord.total_amount || 0,
        method: ord.payment_method || (isCod ? 'Cash on Delivery' : 'Online Payment (Razorpay)'),
        gateway: isCod ? 'COD Executive Collection' : 'Razorpay PG',
        status: isPaid ? (isCod ? 'COLLECTED' : 'PAID') : (isCod ? 'COD_PENDING' : 'UNPAID'),
        isPaid: Boolean(isPaid),
        isCod: Boolean(isCod),
        deliveryStatus: ord.status,
        createdAt: ord.date
      };
    });
  },

  async getCustomers() {
    const store = getStore();
    const custMap = new Map();
    (store.orders || []).forEach((o) => {
      const name = o.shipping_address?.full_name || 'Unknown Customer';
      if (!custMap.has(name)) {
        custMap.set(name, {
          id: `cust-${custMap.size + 101}`,
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: o.shipping_address?.phone || '',
          city: o.shipping_address?.city || '',
          state: o.shipping_address?.state || '',
          joinedDate: o.date ? new Date(o.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          ordersCount: 1,
          totalSpent: o.total_amount || 0,
          status: 'Active'
        });
      } else {
        const c = custMap.get(name);
        c.ordersCount += 1;
        c.totalSpent += o.total_amount || 0;
      }
    });
    return Array.from(custMap.values());
  },

  // COUPONS
  async getCoupons() {
    const store = getStore();
    return store.coupons;
  },

  async addCoupon(coupon) {
    const store = getStore();
    const newCoupon = {
      id: `coup-${Date.now()}`,
      times_used: 0,
      is_active: true,
      ...coupon
    };
    store.coupons.push(newCoupon);
    saveStore(store);
    return newCoupon;
  },

  async updateCoupon(id, updates) {
    const store = getStore();
    const idx = store.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      store.coupons[idx] = { ...store.coupons[idx], ...updates };
      saveStore(store);
      return store.coupons[idx];
    }
    return null;
  },

  async deleteCoupon(id) {
    const store = getStore();
    store.coupons = store.coupons.filter(c => c.id !== id);
    saveStore(store);
    return true;
  },

  // REVIEWS
  async getReviews(productId) {
    const store = getStore();
    if (productId) {
      return store.reviews.filter(r => r.product_id === productId);
    }
    return store.reviews;
  },

  async addReview(review) {
    const store = getStore();
    const newReview = {
      id: `rev-${Date.now()}`,
      date: 'Today',
      helpful_count: 0,
      is_verified_purchase: true,
      images: [],
      ...review
    };
    store.reviews.unshift(newReview);
    saveStore(store);
    return newReview;
  },

  async voteHelpfulReview(reviewId) {
    const store = getStore();
    const rev = store.reviews.find(r => r.id === reviewId);
    if (rev) {
      rev.helpful_count = (rev.helpful_count || 0) + 1;
      saveStore(store);
      return rev.helpful_count;
    }
    return 0;
  },

  // HYDRATE CLOUD DATA
  hydrateUserData(addresses = [], orders = []) {
    const store = getStore();
    let modified = false;

    if (Array.isArray(addresses) && addresses.length > 0) {
      addresses.forEach(cloudAddr => {
        const exists = store.addresses.some(a => a.id === cloudAddr.id || (
          a.pincode === cloudAddr.pincode &&
          a.address_line === cloudAddr.address_line &&
          a.user_id === cloudAddr.user_id
        ));
        if (!exists) {
          store.addresses.push(cloudAddr);
          modified = true;
        }
      });
    }

    if (Array.isArray(orders) && orders.length > 0) {
      orders.forEach(cloudOrd => {
        const exists = store.orders.some(o => o.id === cloudOrd.id || o.order_number === cloudOrd.order_number);
        if (!exists) {
          store.orders.unshift(cloudOrd);
          modified = true;
        }
      });
    }

    if (modified) {
      saveStore(store);
    }
    return store;
  },

  // ADDRESSES
  async getAddresses(filterUser = null) {
    const store = getStore();
    const target = filterUser || getCurrentAuthUser();
    if (!target) {
      // Guest: only addresses with no user assigned
      return (store.addresses || []).filter(a => !a.user_id && !a.user_email);
    }
    const uid = target.uid || target.id;
    const email = (target.email || '').toLowerCase().trim();

    let matched = (store.addresses || []).filter(a => {
      if (uid && a.user_id && a.user_id === uid) return true;
      if (email && a.user_email && a.user_email.toLowerCase() === email) return true;
      return false;
    });

    // If local store has no addresses for this logged-in user, try live cloud recovery
    if (matched.length === 0 && uid) {
      try {
        const { fetchUserFromCloud } = await import('../cloud/cloudSyncService');
        const cloudData = await fetchUserFromCloud(uid);
        if (cloudData && Array.isArray(cloudData.addresses) && cloudData.addresses.length > 0) {
          commerceDb.hydrateUserData(cloudData.addresses, cloudData.orders);
          const reloadedStore = getStore();
          matched = (reloadedStore.addresses || []).filter(a => {
            if (uid && a.user_id && a.user_id === uid) return true;
            if (email && a.user_email && a.user_email.toLowerCase() === email) return true;
            return false;
          });
        }
      } catch (e) { /* ignore */ }
    }

    return matched;
  },

  async addAddress(addr, user = null) {
    const store = getStore();
    const target = user || getCurrentAuthUser();
    const uid = addr.user_id || target?.uid || null;
    const email = (addr.user_email || target?.email || null)?.toLowerCase()?.trim() || null;

    const userAddresses = (store.addresses || []).filter(a => {
      if (uid && a.user_id && a.user_id === uid) return true;
      if (email && a.user_email && a.user_email.toLowerCase() === email) return true;
      return false;
    });

    const newAddr = {
      id: `addr-${Date.now()}`,
      user_id: uid,
      user_email: email,
      is_default: userAddresses.length === 0 || !!addr.is_default,
      ...addr
    };

    if (newAddr.is_default) {
      store.addresses.forEach(a => {
        const isSame = (uid && a.user_id === uid) || (email && a.user_email?.toLowerCase() === email);
        if (isSame) a.is_default = false;
      });
    }
    store.addresses.push(newAddr);
    saveStore(store);

    // Sync user addresses to cloud for multi-device persistence
    if (uid || target?.uid) {
      const activeUser = target || { uid, email };
      import('../cloud/cloudSyncService').then(({ saveUserToCloud }) => {
        const userAddrs = store.addresses.filter(a => a.user_id === activeUser.uid || (a.user_email && a.user_email.toLowerCase() === (activeUser.email || '').toLowerCase()));
        saveUserToCloud(activeUser, { addresses: userAddrs });
      }).catch(() => {});
    }

    return newAddr;
  },

  async updateAddress(id, updates) {
    const store = getStore();
    const idx = store.addresses.findIndex(a => a.id === id);
    if (idx !== -1) {
      const existingAddr = store.addresses[idx];
      const uid = existingAddr.user_id || updates.user_id;
      const email = (existingAddr.user_email || updates.user_email)?.toLowerCase()?.trim();

      if (updates.is_default) {
        store.addresses.forEach(a => {
          const isSame = (uid && a.user_id === uid) || (email && a.user_email?.toLowerCase() === email);
          if (isSame) a.is_default = false;
        });
      }
      store.addresses[idx] = { ...existingAddr, ...updates };
      saveStore(store);

      if (uid) {
        import('../cloud/cloudSyncService').then(({ saveUserToCloud }) => {
          const userAddrs = store.addresses.filter(a => a.user_id === uid || (a.user_email && a.user_email.toLowerCase() === (email || '').toLowerCase()));
          saveUserToCloud({ uid, email }, { addresses: userAddrs });
        }).catch(() => {});
      }

      return store.addresses[idx];
    }
    return null;
  },

  async deleteAddress(id) {
    const store = getStore();
    const toDelete = store.addresses.find(a => a.id === id);
    store.addresses = store.addresses.filter(a => a.id !== id);
    saveStore(store);

    const target = getCurrentAuthUser();
    const uid = toDelete?.user_id || target?.uid;
    const email = toDelete?.user_email || target?.email;
    if (uid) {
      import('../cloud/cloudSyncService').then(({ saveUserToCloud }) => {
        const userAddrs = store.addresses.filter(a => a.user_id === uid || (a.user_email && a.user_email.toLowerCase() === (email || '').toLowerCase()));
        saveUserToCloud({ uid, email }, { addresses: userAddrs });
      }).catch(() => {});
    }

    return true;
  },

  // NOTIFICATIONS
  async getNotifications(filterUser = null) {
    const store = getStore();
    const target = filterUser || getCurrentAuthUser();
    if (!target) {
      // Guest only sees broadcast notifications
      return (store.notifications || []).filter(n => !n.user_id && !n.user_email);
    }
    const uid = target.uid || target.id;
    const email = (target.email || '').toLowerCase().trim();
    return (store.notifications || []).filter(n => {
      if (!n.user_id && !n.user_email) return true;
      if (uid && n.user_id && n.user_id === uid) return true;
      if (email && n.user_email && n.user_email.toLowerCase() === email) return true;
      return false;
    });
  },

  async markNotificationAsRead(id) {
    const store = getStore();
    const notif = store.notifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
    saveStore(store);
    return store.notifications;
  },

  async markAllNotificationsRead() {
    const store = getStore();
    store.notifications.forEach(n => n.is_read = true);
    saveStore(store);
    return store.notifications;
  },

  async clearAllNotifications() {
    const store = getStore();
    store.notifications = [];
    saveStore(store);
    return [];
  },

  async deleteNotification(id) {
    const store = getStore();
    store.notifications = store.notifications.filter(n => n.id !== id);
    saveStore(store);
    return store.notifications;
  },

  // ADMIN ANALYTICS
  async getAdminStats() {
    const store = getStore();
    const totalRevenue = store.orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const totalOrders = store.orders.length;
    const totalProducts = store.products.length;
    const lowStockCount = store.products.filter(p => p.stock <= 5).length;

    const totalCustomers = (store.customers && store.customers.length > 0)
      ? store.customers.length
      : new Set((store.orders || []).map(o => o.shipping_address?.full_name || o.customer_name).filter(Boolean)).size;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      recentOrders: (store.orders || []).slice(0, 5),
      topProducts: (store.products || []).filter(p => p.is_best_seller).slice(0, 4),
      salesTrend: []
    };
  },

  // ==================================================
  // HOMEPAGE SECTIONS CMS ENGINE
  // ==================================================
  async getHomepageSections({ activeOnly = false } = {}) {
    const store = getStore();
    const now = new Date();

    let sections = (store.homepage_sections || []).map(sec => {
      let dynamicStatus = sec.status;
      if (sec.status !== 'disabled' && sec.status !== 'draft') {
        if (sec.start_at && new Date(sec.start_at) > now) {
          dynamicStatus = 'scheduled';
        } else if (sec.end_at && new Date(sec.end_at) < now) {
          dynamicStatus = 'expired';
        } else {
          dynamicStatus = 'active';
        }
      }
      return { ...sec, dynamicStatus };
    });

    if (activeOnly) {
      sections = sections.filter(sec => sec.dynamicStatus === 'active');
    }

    // Sort by display_order ascending
    return sections.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  async getHomepageSectionById(id) {
    const store = getStore();
    return (store.homepage_sections || []).find(s => s.id === id) || null;
  },

  async createHomepageSection(data) {
    const store = getStore();
    store.homepage_sections = store.homepage_sections || [];
    const maxOrder = store.homepage_sections.reduce((max, s) => Math.max(max, s.display_order || 0), 0);
    const newSection = {
      ...data,
      id: `sec-${Date.now()}`,
      display_order: data.display_order ?? maxOrder + 1,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.homepage_sections.push(newSection);
    saveStore(store);
    return newSection;
  },

  async updateHomepageSection(id, updates) {
    const store = getStore();
    store.homepage_sections = store.homepage_sections || [];
    const idx = store.homepage_sections.findIndex(s => s.id === id);
    if (idx !== -1) {
      store.homepage_sections[idx] = {
        ...store.homepage_sections[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveStore(store);
      return store.homepage_sections[idx];
    }
    return null;
  },

  async reorderHomepageSections(orderedSections) {
    const store = getStore();
    store.homepage_sections = store.homepage_sections || [];
    orderedSections.forEach((item, index) => {
      const id = typeof item === 'string' ? item : item.id;
      const target = store.homepage_sections.find(s => s.id === id);
      if (target) {
        target.display_order = index + 1;
      }
    });
    store.homepage_sections.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    saveStore(store);
    return store.homepage_sections;
  },

  async duplicateHomepageSection(id) {
    const store = getStore();
    store.homepage_sections = store.homepage_sections || [];
    const original = store.homepage_sections.find(s => s.id === id);
    if (!original) return null;
    const maxOrder = store.homepage_sections.reduce((max, s) => Math.max(max, s.display_order || 0), 0);
    const duplicated = {
      ...original,
      id: `sec-${Date.now()}`,
      title: `${original.title} (Copy)`,
      display_order: maxOrder + 1,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.homepage_sections.push(duplicated);
    saveStore(store);
    return duplicated;
  },

  async deleteHomepageSection(id) {
    const store = getStore();
    store.homepage_sections = (store.homepage_sections || []).filter(s => s.id !== id);
    // Normalize display orders
    store.homepage_sections.forEach((s, idx) => {
      s.display_order = idx + 1;
    });
    saveStore(store);
    return true;
  },

  // ==================================================
  // DEALS MANAGEMENT
  // ==================================================
  async getDeals({ activeOnly = false } = {}) {
    const store = getStore();
    const now = new Date();
    let deals = (store.deals || []).map(deal => {
      let dynamicStatus = deal.status;
      if (deal.status !== 'disabled') {
        if (deal.start_at && new Date(deal.start_at) > now) {
          dynamicStatus = 'scheduled';
        } else if (deal.end_at && new Date(deal.end_at) < now) {
          dynamicStatus = 'expired';
        } else {
          dynamicStatus = 'active';
        }
      }
      return { ...deal, dynamicStatus };
    });

    if (activeOnly) {
      deals = deals.filter(d => d.dynamicStatus === 'active');
    }
    return deals;
  },

  async getDealById(id) {
    const store = getStore();
    return (store.deals || []).find(d => d.id === id) || null;
  },

  async createDeal(data) {
    const store = getStore();
    store.deals = store.deals || [];
    const newDeal = {
      ...data,
      id: `deal-${Date.now()}`,
      status: data.status || 'active',
      deal_badge: data.deal_badge || 'DEAL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.deals.push(newDeal);
    saveStore(store);
    return newDeal;
  },

  async updateDeal(id, updates) {
    const store = getStore();
    store.deals = store.deals || [];
    const idx = store.deals.findIndex(d => d.id === id);
    if (idx !== -1) {
      store.deals[idx] = {
        ...store.deals[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveStore(store);
      return store.deals[idx];
    }
    return null;
  },

  async deleteDeal(id) {
    const store = getStore();
    store.deals = (store.deals || []).filter(d => d.id !== id);
    saveStore(store);
    return true;
  },

  // ==================================================
  // CAMPAIGNS MANAGEMENT
  // ==================================================
  async getCampaigns() {
    const store = getStore();
    const now = new Date();
    return (store.campaigns || []).map(camp => {
      let dynamicStatus = camp.status;
      if (camp.status !== 'disabled' && camp.status !== 'draft') {
        if (camp.start_at && new Date(camp.start_at) > now) {
          dynamicStatus = 'scheduled';
        } else if (camp.end_at && new Date(camp.end_at) < now) {
          dynamicStatus = 'expired';
        } else {
          dynamicStatus = 'active';
        }
      }
      return { ...camp, dynamicStatus };
    });
  },

  async createCampaign(data) {
    const store = getStore();
    store.campaigns = store.campaigns || [];
    const newCamp = {
      ...data,
      id: `camp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.campaigns.push(newCamp);
    saveStore(store);
    return newCamp;
  },

  async updateCampaign(id, updates) {
    const store = getStore();
    store.campaigns = store.campaigns || [];
    const idx = store.campaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      store.campaigns[idx] = {
        ...store.campaigns[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveStore(store);
      return store.campaigns[idx];
    }
    return null;
  },

  async deleteCampaign(id) {
    const store = getStore();
    store.campaigns = (store.campaigns || []).filter(c => c.id !== id);
    saveStore(store);
    return true;
  },

  // ==================================================
  // DATASET MANAGEMENT (LIVE COMMERCE DATA HUB)
  // ==================================================
  isDatasetOverlayEnabled() {
    const val = localStorage.getItem('cmcart_dataset_overlay_enabled_v1');
    return val === 'true';
  },

  setDatasetOverlayEnabled(enabled) {
    localStorage.setItem('cmcart_dataset_overlay_enabled_v1', enabled ? 'true' : 'false');

    if (!enabled) {
      // Switched OFF: Pure Live Mode -> Only real live database records
      const emptyStore = { ...EMPTY_STORE };
      saveStore(emptyStore);
    } else {
      // Switched ON: Load and activate the active dataset from registry
      const registry = this.getDatasets();
      const active = registry.find(d => d.isActive) || registry[0];
      if (active && active.data) {
        saveStore(active.data);
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('cmcart_dataset_updated', { detail: { enabled } }));
    } catch (e) {}
    return enabled;
  },

  getDatasets() {
    let registry = [];
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (raw !== null) {
        registry = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed reading datasets registry', e);
    }
    // Return whatever is in registry — no auto-seeding of built-in temp
    return registry;
  },

  uploadDataset({ name, description, data }) {
    let registry = this.getDatasets();

    // Standardize incoming data payload
    const incomingData = {
      products: Array.isArray(data.products) ? data.products : (Array.isArray(data.data?.products) ? data.data.products : []),
      categories: Array.isArray(data.categories) ? data.categories : (Array.isArray(data.data?.categories) ? data.data.categories : []),
      orders: Array.isArray(data.orders) ? data.orders : (Array.isArray(data.data?.orders) ? data.data.orders : []),
      coupons: Array.isArray(data.coupons) ? data.coupons : (Array.isArray(data.data?.coupons) ? data.data.coupons : []),
      banners: Array.isArray(data.banners) ? data.banners : (Array.isArray(data.data?.banners) ? data.data.banners : []),
      reviews: Array.isArray(data.reviews) ? data.reviews : (Array.isArray(data.data?.reviews) ? data.data.reviews : []),
      addresses: Array.isArray(data.addresses) ? data.addresses : (Array.isArray(data.data?.addresses) ? data.data.addresses : []),
      notifications: Array.isArray(data.notifications) ? data.notifications : (Array.isArray(data.data?.notifications) ? data.data.notifications : []),
      homepage_sections: Array.isArray(data.homepage_sections) ? data.homepage_sections : INITIAL_HOMEPAGE_SECTIONS,
      deals: Array.isArray(data.deals) ? data.deals : [],
      campaigns: Array.isArray(data.campaigns) ? data.campaigns : []
    };

    const newRev = incomingData.orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const newId = `ds-${Date.now()}`;

    // Mark others as inactive
    registry = registry.map(ds => ({ ...ds, isActive: false }));

    const newEntry = {
      id: newId,
      name: name || `Dataset ${new Date().toLocaleDateString()}`,
      description: description || 'Uploaded custom live dataset',
      isTemporary: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      stats: {
        orders: incomingData.orders.length,
        products: incomingData.products.length,
        categories: incomingData.categories.length,
        revenue: newRev
      },
      data: incomingData
    };

    registry.unshift(newEntry);
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));

    // Overwrite active store and ensure dataset mode is ON
    localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'true');
    saveStore(incomingData);

    try {
      window.dispatchEvent(new CustomEvent('cmcart_dataset_updated', { detail: { activeDatasetId: newId, enabled: true } }));
    } catch (e) {
      // ignore
    }
    return newEntry;
  },

  activateDataset(datasetId) {
    let registry = this.getDatasets();
    const target = registry.find(d => d.id === datasetId);
    if (!target) return false;

    if (target.data) {
      saveStore(target.data);
    }

    registry = registry.map(ds => ({
      ...ds,
      isActive: ds.id === datasetId
    }));
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'true');

    try {
      window.dispatchEvent(new CustomEvent('cmcart_dataset_updated', { detail: { activeDatasetId: datasetId, enabled: true } }));
    } catch (e) {
      // ignore
    }
    return true;
  },

  deleteDataset(datasetId) {
    let registry = this.getDatasets();
    const targetIndex = registry.findIndex(d => d.id === datasetId);
    if (targetIndex === -1) return false;

    const wasActive = registry[targetIndex].isActive;
    registry.splice(targetIndex, 1);

    if (wasActive) {
      // Find next available dataset (prefer non-temporary ones)
      const nextDataset = registry.find(d => d.data);
      if (nextDataset) {
        registry = registry.map(d => ({ ...d, isActive: d.id === nextDataset.id }));
        saveStore(nextDataset.data);
        localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'true');
      } else {
        // No datasets remain — purge store to empty state, disable overlay
        saveStore({ ...EMPTY_STORE });
        localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'false');
      }
    }

    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));

    try {
      window.dispatchEvent(new CustomEvent('cmcart_dataset_updated', {
        detail: { activeDatasetId: registry.find(d => d.isActive)?.id || null }
      }));
    } catch (e) {
      // ignore
    }
    return true;
  },

  purgeAllData() {
    const emptyStore = { ...EMPTY_STORE };
    saveStore(emptyStore);

    // Clear registry entirely
    localStorage.setItem(REGISTRY_KEY, JSON.stringify([]));
    localStorage.setItem('cmcart_dataset_overlay_enabled_v1', 'false');

    try {
      window.dispatchEvent(new CustomEvent('cmcart_dataset_updated', { detail: { activeDatasetId: null } }));
    } catch (e) {
      // ignore
    }
    return true;
  },

  getMasterTemplate() {
    return {
      metadata: {
        template_name: "CMCart Master Live Commerce Dataset Template",
        version: "2.0",
        format: "application/json",
        description: "Official import template for CMCart and external analytics (CMCart Insights)",
        generated_at: new Date().toISOString()
      },
      instructions: [
        "1. Fill in your real categories, products, orders, and coupons in the arrays below.",
        "2. Save this file as a .json file and upload it in CMCart Settings -> Dataset Manager.",
        "3. Once uploaded, CMCart immediately runs with this data and the API exposes it to CMCart Insights.",
        "4. You can delete or replace this dataset anytime with 1-click."
      ],
      categories: [
        {
          id: "cat-electronics",
          name: "Electronics",
          slug: "electronics",
          description: "Smartphones, Audio, Laptops and Accessories",
          icon: "Smartphone",
          is_active: true
        },
        {
          id: "cat-fashion",
          name: "Fashion",
          slug: "fashion",
          description: "Apparel, Footwear and Accessories",
          icon: "Shirt",
          is_active: true
        }
      ],
      products: [
        {
          id: "prod-1001",
          name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
          slug: "sony-wh-1000xm5-headphones",
          category_id: "cat-electronics",
          category_name: "Electronics",
          brand: "Sony",
          sku: "SNY-WH1000XM5-BLK",
          current_price: 26990,
          original_price: 34990,
          discount_percentage: 23,
          rating: 4.8,
          review_count: 1420,
          stock: 45,
          status: "in_stock",
          is_active: true,
          is_featured: true,
          is_deal_of_the_day: true,
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
          ],
          description: "Premium noise cancelling headphones with 30-hour battery life."
        }
      ],
      orders: [
        {
          id: "ord-90001",
          order_number: "CMC-2026-90001",
          date: new Date().toISOString(),
          status: "Delivered",
          subtotal: 26990,
          discount_amount: 1000,
          delivery_fee: 0,
          tax_amount: 4678,
          total_amount: 30668,
          payment_method: "UPI",
          payment_status: "Paid",
          tracking_number: "BLUEDART-992144",
          carrier: "BlueDart Express",
          shipping_address: {
            full_name: "Rahul Sharma",
            phone: "+91 98765 43210",
            address_line: "Flat 402, Skyline Residency, Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560038"
          },
          items: [
            {
              product_id: "prod-1001",
              product_name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
              unit_price: 26990,
              quantity: 1,
              total: 26990
            }
          ]
        }
      ],
      coupons: [
        {
          id: "coup-1",
          code: "WELCOME50",
          discount_type: "fixed",
          discount_value: 500,
          minimum_order_amount: 1999,
          is_active: true
        }
      ]
    };
  }
};

export { supabase };
