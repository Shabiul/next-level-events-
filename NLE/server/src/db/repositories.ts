import { supabase } from "./supabase";
import { getCuratedPackageByIdOrName } from "../../utils/curatedPackages";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
export interface DbUser {
  id: string;
  legacy_mongo_id?: string | null;
  email?: string | null;
  phone?: string | null;
  first_name?: string;
  last_name?: string;
  password_hash?: string;
  google_id?: string | null;
  photo_url?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  role: "user" | "staff" | "admin";
  permissions?: string[];
  reset_password_token?: string | null;
  reset_password_expires?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbCategory {
  id: string;
  legacy_mongo_id?: string | null;
  name: string;
  slug?: string;
  image?: string;
  order_num?: number;
  active?: boolean;
  subcategories?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface DbProduct {
  id: string;
  legacy_mongo_id?: string | null;
  name: string;
  category_id?: string | null;
  category_name?: string;
  subcategory?: string;
  price: number;
  original_price?: number | null;
  description?: string;
  inclusions?: string[];
  image: string;
  more_images?: string[];
  badge?: string | null;
  badge_color?: "purple" | "pink" | "gold" | "green";
  rating?: number;
  review_count?: number;
  active?: boolean;
  featured?: boolean;
  order_count?: number;
  add_ons_inline?: any[];
  activities_inline?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface DbAddon {
  id: string;
  legacy_mongo_id?: string | null;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbOrder {
  id: string;
  legacy_mongo_id?: string | null;
  order_number: string;
  user_id?: string | null;
  customer_id?: string | null;
  product_id?: string | null;
  product_name: string;
  category_name?: string;
  subcategory?: string;
  package_price: number;
  subtotal: number;
  addon_total?: number;
  activity_total?: number;
  amount: number;
  grand_total: number;
  payment_method: "razorpay" | "whatsapp";
  payment_status: "pending" | "paid" | "failed" | "cancelled";
  order_status: string;
  customer_snapshot: any;
  product_snapshot: any;
  booking_snapshot: any;
  addons_snapshot: any[];
  activities_snapshot: any[];
  booking_details: any[];
  status_history: any[];
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbCart {
  id: string;
  user_id: string;
  items: any[];
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// USER REPOSITORY
// ---------------------------------------------------------------------------
export const UserRepository = {
  async findById(id: string): Promise<DbUser | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async findByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findByPhone(phone: string): Promise<DbUser | null> {
    const { data, error } = await supabase.from("users").select("*").eq("phone", phone.trim()).maybeSingle();
    if (error) throw error;
    return data;
  },

  async findByResetToken(hashedToken: string): Promise<DbUser | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("reset_password_token", hashedToken)
      .gt("reset_password_expires", now)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(user: Partial<DbUser>): Promise<DbUser> {
    const { data, error } = await supabase.from("users").insert(user).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listStaff(): Promise<DbUser[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "staff")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listAll(limit = 100): Promise<DbUser[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role, phone, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ---------------------------------------------------------------------------
// CATEGORY REPOSITORY
// ---------------------------------------------------------------------------
export const CategoryRepository = {
  async listAll(): Promise<(DbCategory & { productCount?: number })[]> {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("order_num", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;

    // Get counts from products table
    const { data: productCounts } = await supabase.from("products").select("category_id");
    const countMap: Record<string, number> = {};
    (productCounts || []).forEach((p) => {
      if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
    });

    return (categories || []).map((cat) => ({
      ...cat,
      order: cat.order_num,
      _id: cat.id,
      productCount: countMap[cat.id] || 0,
    }));
  },

  async findById(id: string): Promise<DbCategory | null> {
    const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? { ...data, _id: data.id, order: data.order_num } : null;
  },

  async findByName(name: string): Promise<DbCategory | null> {
    const { data, error } = await supabase.from("categories").select("*").ilike("name", name.trim()).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(cat: Partial<DbCategory>): Promise<DbCategory> {
    const { count } = await supabase.from("categories").select("*", { count: "exact", head: true });
    const order_num = cat.order_num ?? (count || 0);
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...cat, order_num })
      .select("*")
      .single();
    if (error) throw error;
    return { ...data, _id: data.id, order: data.order_num };
  },

  async update(id: string, updates: Partial<DbCategory>): Promise<DbCategory | null> {
    const { data, error } = await supabase
      .from("categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? { ...data, _id: data.id, order: data.order_num } : null;
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("categories").update({ order_num: index }).eq("id", id)
      )
    );
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ---------------------------------------------------------------------------
// ADDON REPOSITORY
// ---------------------------------------------------------------------------
export const AddonRepository = {
  async listAll(): Promise<DbAddon[]> {
    const { data, error } = await supabase.from("addons").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((a) => ({ ...a, _id: a.id }));
  },

  async listActive(): Promise<DbAddon[]> {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((a) => ({ ...a, _id: a.id }));
  },

  async findByIds(ids: string[]): Promise<DbAddon[]> {
    if (!ids.length) return [];
    const { data, error } = await supabase.from("addons").select("*").in("id", ids).eq("active", true);
    if (error) throw error;
    return (data || []).map((a) => ({ ...a, _id: a.id }));
  },

  async findById(id: string): Promise<DbAddon | null> {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
      .maybeSingle();
    if (error) throw error;
    return data ? { ...data, _id: data.id } : null;
  },

  async findByName(name: string): Promise<DbAddon | null> {
    const trimmed = (name || "").trim();
    if (!trimmed) return null;
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .ilike("name", trimmed)
      .maybeSingle();
    if (error) throw error;
    return data ? { ...data, _id: data.id } : null;
  },

  async create(addon: Partial<DbAddon>): Promise<DbAddon> {
    const { data, error } = await supabase.from("addons").insert(addon).select("*").single();
    if (error) throw error;
    return { ...data, _id: data.id };
  },

  async update(id: string, updates: Partial<DbAddon>): Promise<DbAddon | null> {
    const { data, error } = await supabase
      .from("addons")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? { ...data, _id: data.id } : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("addons").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ---------------------------------------------------------------------------
// PRODUCT REPOSITORY
// ---------------------------------------------------------------------------
export const ProductRepository = {
  async listAll(options: {
    categoryId?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<any[]> {
    let query = supabase.from("products").select("*, product_addons(addon:addons(*))");
    if (options.activeOnly) query = query.eq("active", true);
    if (options.categoryId) query = query.eq("category_id", options.categoryId);
    if (options.search) {
      const cleaned = options.search.replace(/[,\(\)\"\'\\]/g, " ").trim();
      if (cleaned) {
        const s = cleaned.replace(/[%_]/g, "\\$&");
        query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%,subcategory.ilike.%${s}%`);
      }
    }

    query = query.order("order_count", { ascending: false }).order("created_at", { ascending: false });

    if (options.page && options.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((p: any) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      categoryId: p.category_id,
      categoryName: p.category_name,
      subcategory: p.subcategory,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      description: p.description,
      inclusions: p.inclusions || [],
      image: p.image,
      moreImages: p.more_images || [],
      badge: p.badge,
      badgeColor: p.badge_color,
      rating: Number(p.rating || 0),
      reviewCount: Number(p.review_count || 0),
      active: p.active,
      featured: p.featured,
      orderCount: Number(p.order_count || 0),
      addOns: p.add_ons_inline || [],
      activities: p.activities_inline || [],
      addons: (p.product_addons || []).map((pa: any) => ({ ...pa.addon, _id: pa.addon?.id })).filter(Boolean),
    }));
  },

  async findById(id: string): Promise<any | null> {
    if (!id || typeof id !== "string") return null;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_addons(addon:addons(*))")
        .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
        .maybeSingle();
      if (!error && data) {
        const p: any = data;
        return {
          _id: p.id,
          id: p.id,
          name: p.name,
          categoryId: p.category_id,
          categoryName: p.category_name,
          subcategory: p.subcategory,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          description: p.description,
          inclusions: p.inclusions || [],
          image: p.image,
          moreImages: p.more_images || [],
          badge: p.badge,
          badgeColor: p.badge_color,
          rating: Number(p.rating || 0),
          reviewCount: Number(p.review_count || 0),
          active: p.active,
          featured: p.featured,
          orderCount: Number(p.order_count || 0),
          addOns: p.add_ons_inline || [],
          activities: p.activities_inline || [],
          addons: (p.product_addons || []).map((pa: any) => ({ ...pa.addon, _id: pa.addon?.id })).filter(Boolean),
        };
      }
    } catch (err) {
      console.warn(`[ProductRepository] findById query failed for "${id}":`, err);
    }

    // Curated package fallback (e.g. 'essential-celebration', 'fun-fiesta', etc.)
    const curated = getCuratedPackageByIdOrName(id);
    if (curated) return curated;

    return null;
  },

  async findByName(name: string): Promise<any | null> {
    if (!name || typeof name !== "string") return null;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_addons(addon:addons(*))")
        .ilike("name", name.trim())
        .maybeSingle();
      if (!error && data) {
        const p: any = data;
        return {
          _id: p.id,
          id: p.id,
          name: p.name,
          categoryId: p.category_id,
          categoryName: p.category_name,
          subcategory: p.subcategory,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          description: p.description,
          inclusions: p.inclusions || [],
          image: p.image,
          moreImages: p.more_images || [],
          badge: p.badge,
          badgeColor: p.badge_color,
          rating: Number(p.rating || 0),
          reviewCount: Number(p.review_count || 0),
          active: p.active,
          featured: p.featured,
          orderCount: Number(p.order_count || 0),
          addOns: p.add_ons_inline || [],
          activities: p.activities_inline || [],
          addons: (p.product_addons || []).map((pa: any) => ({ ...pa.addon, _id: pa.addon?.id })).filter(Boolean),
        };
      }
    } catch (err) {
      console.warn(`[ProductRepository] findByName query failed for "${name}":`, err);
    }

    const curated = getCuratedPackageByIdOrName(name);
    if (curated) return curated;

    return null;
  },

  async incrementOrderCount(id: string): Promise<number> {
    const p = await this.findById(id);
    if (!p) return 0;
    const newCount = (p.orderCount || 0) + 1;
    await supabase.from("products").update({ order_count: newCount }).eq("id", id);
    return newCount;
  },

  async create(payload: any): Promise<any> {
    const productData: Partial<DbProduct> = {
      name: payload.name,
      category_id: payload.categoryId || payload.category_id || null,
      category_name: payload.categoryName || payload.category_name || "",
      subcategory: payload.subcategory || "",
      price: Number(payload.price || 0),
      original_price: payload.originalPrice ? Number(payload.originalPrice) : null,
      description: payload.description || "",
      inclusions: payload.inclusions || [],
      image: payload.image,
      more_images: payload.moreImages || [],
      badge: payload.badge || null,
      badge_color: payload.badgeColor || "purple",
      rating: Number(payload.rating || 0),
      review_count: Number(payload.reviewCount || 0),
      active: payload.active !== false,
      featured: Boolean(payload.featured),
      order_count: Number(payload.orderCount || 0),
      add_ons_inline: payload.addOns || [],
      activities_inline: payload.activities || [],
    };

    const { data, error } = await supabase.from("products").insert(productData).select("*").single();
    if (error) throw error;

    // Link addons
    if (Array.isArray(payload.addons) && payload.addons.length > 0) {
      const links = payload.addons
        .map((a: any) => (typeof a === "string" ? a : a._id || a.id))
        .filter(Boolean)
        .map((addonId: string) => ({ product_id: data.id, addon_id: addonId }));
      if (links.length) await supabase.from("product_addons").insert(links);
    }

    return this.findById(data.id);
  },

  async update(id: string, payload: any): Promise<any | null> {
    const updates: Partial<DbProduct> = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.categoryId !== undefined) updates.category_id = payload.categoryId;
    if (payload.categoryName !== undefined) updates.category_name = payload.categoryName;
    if (payload.subcategory !== undefined) updates.subcategory = payload.subcategory;
    if (payload.price !== undefined) updates.price = Number(payload.price);
    if (payload.originalPrice !== undefined) updates.original_price = payload.originalPrice ? Number(payload.originalPrice) : null;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.inclusions !== undefined) updates.inclusions = payload.inclusions;
    if (payload.image !== undefined) updates.image = payload.image;
    if (payload.moreImages !== undefined) updates.more_images = payload.moreImages;
    if (payload.badge !== undefined) updates.badge = payload.badge;
    if (payload.badgeColor !== undefined) updates.badge_color = payload.badgeColor;
    if (payload.rating !== undefined) updates.rating = Number(payload.rating);
    if (payload.reviewCount !== undefined) updates.review_count = Number(payload.reviewCount);
    if (payload.active !== undefined) updates.active = payload.active;
    if (payload.featured !== undefined) updates.featured = payload.featured;
    if (payload.orderCount !== undefined) updates.order_count = Number(payload.orderCount);
    if (payload.addOns !== undefined) updates.add_ons_inline = payload.addOns;
    if (payload.activities !== undefined) updates.activities_inline = payload.activities;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase.from("products").update(updates).eq("id", id);
    if (error) throw error;

    // Update addons relations if provided
    if (Array.isArray(payload.addons)) {
      await supabase.from("product_addons").delete().eq("product_id", id);
      const links = payload.addons
        .map((a: any) => (typeof a === "string" ? a : a._id || a.id))
        .filter(Boolean)
        .map((addonId: string) => ({ product_id: id, addon_id: addonId }));
      if (links.length) await supabase.from("product_addons").insert(links);
    }

    return this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ---------------------------------------------------------------------------
// ORDER REPOSITORY
// ---------------------------------------------------------------------------
export const OrderRepository = {
  async generateNextOrderNumber(): Promise<string> {
    // Find highest existing order number
    const { data } = await supabase
      .from("orders")
      .select("order_number")
      .like("order_number", "TDP%")
      .order("created_at", { ascending: false })
      .limit(10);

    let maxSeq = 0;
    (data || []).forEach((row) => {
      const match = row.order_number?.match(/^TDP(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });

    const nextSeq = maxSeq + 1;
    return `TDP${String(nextSeq).padStart(6, "0")}`;
  },

  async create(orderPayload: Partial<DbOrder>): Promise<DbOrder> {
    if (!orderPayload.order_number) {
      orderPayload.order_number = await this.generateNextOrderNumber();
    }
    if (!orderPayload.status_history || orderPayload.status_history.length === 0) {
      orderPayload.status_history = [{ status: orderPayload.order_status || "Pending", updatedAt: new Date() }];
    }

    const { data, error } = await supabase.from("orders").insert(orderPayload).select("*").single();
    if (error) throw error;
    return { ...data, _id: data.id, orderNumber: data.order_number };
  },

  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.mapOrder(data);
  },

  async findByPaymentId(razorpayPaymentId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("razorpay_payment_id", razorpayPaymentId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.mapOrder(data);
  },

  async listByUser(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`user_id.eq.${userId},customer_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((o) => this.mapOrder(o));
  },

  async listAdmin(options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    paymentMethod?: string;
    paymentStatus?: string;
  }): Promise<{ orders: any[]; total: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase.from("orders").select("*", { count: "exact" });

    if (options.status && options.status !== "all") {
      query = query.ilike("order_status", options.status);
    }
    if (options.paymentMethod) {
      query = query.eq("payment_method", options.paymentMethod);
    }
    if (options.paymentStatus && options.paymentStatus !== "all") {
      query = query.eq("payment_status", options.paymentStatus);
    }

    if (options.search) {
      const s = options.search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `order_number.ilike.%${s}%,product_name.ilike.%${s}%,category_name.ilike.%${s}%,razorpay_payment_id.ilike.%${s}%`
      );
    }

    const sortCol = options.sortBy === "createdAt" ? "created_at" : options.sortBy || "created_at";
    query = query.order(sortCol, { ascending: options.sortDir === "asc" }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count || 0;
    return {
      orders: (data || []).map((o) => this.mapOrder(o)),
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateStatus(
    id: string,
    orderStatus?: string,
    paymentStatus?: string
  ): Promise<any | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    let statusHistory = existing.statusHistory || [];

    if (orderStatus && existing.orderStatus !== orderStatus) {
      updates.order_status = orderStatus;
      statusHistory = [...statusHistory, { status: orderStatus, updatedAt: new Date() }];
      updates.status_history = statusHistory;
    }

    if (paymentStatus && ["pending", "paid", "failed", "cancelled"].includes(paymentStatus)) {
      updates.payment_status = paymentStatus;
    }

    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select("*").single();
    if (error) throw error;
    return this.mapOrder(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  mapOrder(o: any) {
    return {
      _id: o.id,
      id: o.id,
      orderNumber: o.order_number,
      userId: o.user_id,
      customerId: o.customer_id,
      productId: o.product_id,
      productName: o.product_name,
      categoryName: o.category_name,
      subcategory: o.subcategory,
      packagePrice: Number(o.package_price),
      subtotal: Number(o.subtotal),
      addonTotal: Number(o.addon_total || 0),
      activityTotal: Number(o.activity_total || 0),
      amount: Number(o.amount),
      grandTotal: Number(o.grand_total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      customer: o.customer_snapshot,
      product: o.product_snapshot,
      booking: o.booking_snapshot,
      addons: o.addons_snapshot || [],
      activities: o.activities_snapshot || [],
      bookingDetails: o.booking_details || [],
      statusHistory: o.status_history || [],
      razorpayOrderId: o.razorpay_order_id,
      razorpayPaymentId: o.razorpay_payment_id,
      razorpaySignature: o.razorpay_signature,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    };
  },
};

// ---------------------------------------------------------------------------
// CART & WISHLIST REPOSITORY
// ---------------------------------------------------------------------------
export const CartRepository = {
  async getByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase.from("carts").select("items").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return Array.isArray(data?.items) ? data!.items : [];
  },

  async save(userId: string, items: any[]): Promise<void> {
    const { error } = await supabase.from("carts").upsert(
      { user_id: userId, items, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  },
};

export const WishlistRepository = {
  async getByUserId(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from("wishlists").select("product_id").eq("user_id", userId);
    if (error) throw error;
    return (data || []).map((w) => w.product_id);
  },

  async add(userId: string, productId: string): Promise<void> {
    await supabase.from("wishlists").upsert({ user_id: userId, product_id: productId });
  },

  async remove(userId: string, productId: string): Promise<void> {
    await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId);
  },
};

// ---------------------------------------------------------------------------
// SLIDER, SITE CONTENT, ENQUIRIES, OTP
// ---------------------------------------------------------------------------
export const SliderRepository = {
  async listAll(): Promise<any[]> {
    const { data, error } = await supabase.from("sliders").select("*").order("order_num", { ascending: true });
    if (error) throw error;
    return (data || []).map((s) => ({ ...s, _id: s.id, order: s.order_num }));
  },

  async create(slider: any): Promise<any> {
    const { count } = await supabase.from("sliders").select("*", { count: "exact", head: true });
    const order_num = slider.order ?? (count || 0);
    const { data, error } = await supabase
      .from("sliders")
      .insert({ ...slider, order_num })
      .select("*")
      .single();
    if (error) throw error;
    return { ...data, _id: data.id, order: data.order_num };
  },

  async update(id: string, updates: any): Promise<any> {
    const payload = { ...updates };
    if (payload.order !== undefined) payload.order_num = payload.order;
    delete payload.order;
    const { data, error } = await supabase.from("sliders").update(payload).eq("id", id).select("*").single();
    if (error) throw error;
    return { ...data, _id: data.id, order: data.order_num };
  },

  async reorder(sliders: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
      sliders.map((item) => supabase.from("sliders").update({ order_num: item.order }).eq("id", item.id))
    );
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("sliders").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

export const SiteContentRepository = {
  async getByKey(key: string): Promise<{ title: string; content: string } | null> {
    const { data, error } = await supabase.from("site_content").select("*").eq("key", key).maybeSingle();
    if (error) throw error;
    return data ? { title: data.title, content: data.content } : null;
  },

  async listAll(): Promise<any[]> {
    const { data, error } = await supabase.from("site_content").select("*");
    if (error) throw error;
    return data || [];
  },

  async upsert(key: string, title: string, content: string): Promise<any> {
    const { data, error } = await supabase
      .from("site_content")
      .upsert({ key, title, content, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
};

export const EnquiryRepository = {
  async create(enquiry: any): Promise<any> {
    const { data, error } = await supabase.from("enquiries").insert(enquiry).select("*").single();
    if (error) throw error;
    return { ...data, _id: data.id };
  },

  async list(page = 1, limit = 25, status?: string): Promise<{ items: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = supabase.from("enquiries").select("*", { count: "exact" });
    if (status && status !== "all") query = query.eq("status", status);
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { items: (data || []).map((e) => ({ ...e, _id: e.id })), total: count || 0 };
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const { data, error } = await supabase
      .from("enquiries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return { ...data, _id: data.id };
  },
};

export const OtpRepository = {
  async findRecent(phone: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("otp_tokens")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(token: { phone: string; codeHash: string; expiresAt: Date }): Promise<void> {
    await supabase.from("otp_tokens").delete().eq("phone", token.phone);
    const { error } = await supabase.from("otp_tokens").insert({
      phone: token.phone,
      code_hash: token.codeHash,
      purpose: "login",
      attempts: 0,
      last_sent_at: new Date().toISOString(),
      expires_at: token.expiresAt.toISOString(),
    });
    if (error) throw error;
  },

  async incrementAttempts(id: string, attempts: number): Promise<void> {
    await supabase.from("otp_tokens").update({ attempts }).eq("id", id);
  },

  async deleteForPhone(phone: string): Promise<void> {
    await supabase.from("otp_tokens").delete().eq("phone", phone);
  },
};

// ---------------------------------------------------------------------------
// CHAT REPOSITORY (AI Assistant Conversation Persistence)
// ---------------------------------------------------------------------------
export interface DbChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface DbChatSession {
  session_id: string;
  messages: DbChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export const ChatRepository = {
  async getOrCreate(sessionId: string): Promise<DbChatSession> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return {
        session_id: data.session_id,
        messages: Array.isArray(data.messages) ? data.messages : [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }

    const newSession = {
      session_id: sessionId,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from("chat_sessions")
      .insert(newSession)
      .select("*")
      .single();

    if (insertError) {
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (existing) {
        return {
          session_id: existing.session_id,
          messages: Array.isArray(existing.messages) ? existing.messages : [],
        };
      }
      throw insertError;
    }

    return {
      session_id: inserted.session_id,
      messages: Array.isArray(inserted.messages) ? inserted.messages : [],
    };
  },

  async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<DbChatSession> {
    const session = await this.getOrCreate(sessionId);
    const updatedMessages: DbChatMessage[] = [
      ...session.messages,
      { role, content, timestamp: new Date().toISOString() },
    ];

    const { data, error } = await supabase
      .from("chat_sessions")
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .select("*")
      .single();

    if (error) throw error;
    return {
      session_id: data.session_id,
      messages: Array.isArray(data.messages) ? data.messages : [],
    };
  },

  async getConversation(sessionId: string): Promise<DbChatMessage[]> {
    const session = await this.getOrCreate(sessionId);
    return session.messages;
  },

  async clearConversation(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("chat_sessions")
      .update({
        messages: [],
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) throw error;
  },
};
