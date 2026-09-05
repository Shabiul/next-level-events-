import { supabase } from "./supabase.js";

export interface SyncSupabaseAuthParams {
  email: string;
  password?: string;
  role: "admin" | "staff" | "user";
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  permissions?: string[];
  confirmEmail?: boolean;
}

export interface SupabaseAuthResult {
  success: boolean;
  authId?: string;
  isNewUser?: boolean;
  error?: string;
}

/**
 * Searches for a user in Supabase Auth (auth.users) by email.
 */
export async function findSupabaseAuthUserByEmail(email: string) {
  try {
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error || !data?.users) {
      console.warn("[supabase-auth] listUsers error:", error?.message || error);
      return null;
    }
    return (data.users as any[]).find((u: any) => u.email?.toLowerCase() === normalized) || null;
  } catch (err: any) {
    console.warn("[supabase-auth] findUser exception:", err?.message || err);
    return null;
  }
}

/**
 * Creates or synchronizes a user in Supabase Auth (auth.users).
 * Always sets email_confirm: true (unless explicitly set to false),
 * ensuring NO email verification is needed for staff or admin accounts.
 */
export async function syncUserToSupabaseAuth(params: SyncSupabaseAuthParams): Promise<SupabaseAuthResult> {
  const {
    email,
    password,
    role,
    firstName = "",
    lastName = "",
    phone = null,
    permissions = [],
    confirmEmail = true,
  } = params;

  const normalizedEmail = email.trim().toLowerCase();
  const userMetadata = {
    role,
    first_name: firstName,
    last_name: lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || normalizedEmail,
    phone: phone || undefined,
    permissions: role === "staff" ? permissions : undefined,
  };

  try {
    const existing = await findSupabaseAuthUserByEmail(normalizedEmail);

    if (existing) {
      // User already exists in auth.users - update credentials and metadata
      const updatePayload: Record<string, any> = {
        user_metadata: {
          ...existing.user_metadata,
          ...userMetadata,
        },
      };

      if (confirmEmail) {
        updatePayload.email_confirm = true;
      }
      if (password) {
        updatePayload.password = password;
      }

      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, updatePayload);
      if (error) {
        console.error("[supabase-auth] updateUserById error:", error.message);
        return { success: false, error: error.message, authId: existing.id };
      }

      console.log(`[supabase-auth] Synced existing auth user ${normalizedEmail} (Role: ${role}, confirmed: true)`);
      return { success: true, authId: data?.user?.id || existing.id, isNewUser: false };
    }

    // User does not exist in auth.users - create directly with email_confirm: true
    if (!password) {
      return { success: false, error: "Password required to create new Supabase Auth user" };
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: confirmEmail, // Bypasses email verification completely
      user_metadata: userMetadata,
    });

    if (error) {
      console.error("[supabase-auth] createUser error:", error.message);
      return { success: false, error: error.message };
    }

    console.log(`[supabase-auth] Created new auth user ${normalizedEmail} (Role: ${role}, confirmed: true, ID: ${data?.user?.id})`);
    return { success: true, authId: data?.user?.id, isNewUser: true };
  } catch (err: any) {
    console.error("[supabase-auth] syncUserToSupabaseAuth unexpected error:", err?.message || err);
    return { success: false, error: err?.message || "Failed to sync to Supabase Auth" };
  }
}

/**
 * Updates metadata for a user in Supabase Auth.
 */
export async function updateSupabaseAuthMetadata(email: string, metadata: Record<string, any>): Promise<boolean> {
  try {
    const user = await findSupabaseAuthUserByEmail(email);
    if (!user) return false;

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        ...metadata,
      },
    });

    if (error) {
      console.warn("[supabase-auth] update metadata error:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("[supabase-auth] update metadata exception:", err?.message || err);
    return false;
  }
}

/**
 * Deletes a user from Supabase Auth (auth.users).
 */
export async function deleteUserFromSupabaseAuth(email: string): Promise<boolean> {
  try {
    const user = await findSupabaseAuthUserByEmail(email);
    if (!user) {
      console.log(`[supabase-auth] User ${email} not found in auth.users (nothing to delete).`);
      return true;
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("[supabase-auth] deleteUser error:", error.message);
      return false;
    }

    console.log(`[supabase-auth] Successfully removed ${email} from auth.users.`);
    return true;
  } catch (err: any) {
    console.error("[supabase-auth] deleteUser exception:", err?.message || err);
    return false;
  }
}
