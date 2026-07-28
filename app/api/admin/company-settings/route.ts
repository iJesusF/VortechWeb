import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { companySettingsSchema } from "@/lib/validations/company-settings";

const ASSETS_BUCKET = "document-assets";
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const logoTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
]);

async function getAuthenticatedClient() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión administrativa no válida." },
        { status: 401 }
      );
    }

    const validation = companySettingsSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ??
            "La configuración de empresa no es válida.",
        },
        { status: 400 }
      );
    }

    const { data: existing, error: readError } = await supabase
      .from("company_settings")
      .select("*")
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (readError) {
      return NextResponse.json(
        { error: `Supabase no pudo leer la configuración: ${readError.message}` },
        { status: 500 }
      );
    }

    const values = validation.data;
    const payload = {
      ...values,
      website: values.website || null,
    };

    const result = existing
      ? await supabase
          .from("company_settings")
          .update(payload)
          .eq("id", existing.id)
          .select("*")
          .single()
      : await supabase
          .from("company_settings")
          .insert({
            ...payload,
            logo_url: null,
            logo_storage_path: null,
            next_quote_number: 1,
          })
          .select("*")
          .single();

    if (result.error) {
      return NextResponse.json(
        { error: `Supabase no pudo guardar la configuración: ${result.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: result.data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión administrativa no válida." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const logo = formData.get("logo");
    if (!(logo instanceof File)) {
      return NextResponse.json({ error: "Selecciona un archivo de logo." }, { status: 400 });
    }

    const extension = logoTypes.get(logo.type);
    if (!extension) {
      return NextResponse.json(
        { error: "El logo debe ser PNG o JPG/JPEG." },
        { status: 400 }
      );
    }
    if (logo.size === 0 || logo.size > MAX_LOGO_BYTES) {
      return NextResponse.json(
        { error: "El logo debe pesar entre 1 byte y 5 MB." },
        { status: 400 }
      );
    }

    const { data: settings, error: settingsError } = await supabase
      .from("company_settings")
      .select("*")
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (settingsError || !settings) {
      return NextResponse.json(
        {
          error: settingsError
            ? `Supabase no pudo leer la configuración: ${settingsError.message}`
            : "Guarda primero los datos de la empresa.",
        },
        { status: 500 }
      );
    }

    const storagePath = `logos/${settings.id}/${crypto.randomUUID()}.${extension}`;
    const bytes = Buffer.from(await logo.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(ASSETS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: logo.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json(
        { error: `Supabase Storage no pudo subir el logo: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from(ASSETS_BUCKET)
      .getPublicUrl(storagePath);
    const { data: updated, error: updateError } = await supabase
      .from("company_settings")
      .update({
        logo_url: publicUrl.publicUrl,
        logo_storage_path: storagePath,
      })
      .eq("id", settings.id)
      .select("*")
      .single();

    if (updateError) {
      await supabase.storage.from(ASSETS_BUCKET).remove([storagePath]);
      return NextResponse.json(
        { error: `Supabase no pudo asociar el logo: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (settings.logo_storage_path) {
      const { error: removeError } = await supabase.storage
        .from(ASSETS_BUCKET)
        .remove([settings.logo_storage_path]);
      if (removeError) {
        console.error("[company-settings]", {
          event: "old_logo_cleanup_failed",
          path: settings.logo_storage_path,
          code: removeError.name,
          message: removeError.message,
        });
      }
    }

    return NextResponse.json({ settings: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo subir el logo.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión administrativa no válida." },
        { status: 401 }
      );
    }

    const { data: settings, error: readError } = await supabase
      .from("company_settings")
      .select("*")
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (readError || !settings) {
      return NextResponse.json(
        {
          error: readError
            ? `Supabase no pudo leer la configuración: ${readError.message}`
            : "No existe una configuración de empresa.",
        },
        { status: 404 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("company_settings")
      .update({ logo_url: null, logo_storage_path: null })
      .eq("id", settings.id)
      .select("*")
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: `Supabase no pudo eliminar el logo: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (settings.logo_storage_path) {
      const { error: removeError } = await supabase.storage
        .from(ASSETS_BUCKET)
        .remove([settings.logo_storage_path]);
      if (removeError) {
        console.error("[company-settings]", {
          event: "logo_delete_failed",
          path: settings.logo_storage_path,
          code: removeError.name,
          message: removeError.message,
        });
      }
    }

    return NextResponse.json({ settings: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo eliminar el logo.",
      },
      { status: 500 }
    );
  }
}
