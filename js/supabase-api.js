/* Backend: cliente de Supabase para autenticación, progreso e intentos.
   La clave es la "publishable key" (pública por diseño): la seguridad real la
   dan las políticas RLS en la base, que solo dejan a cada usuario ver/escribir
   sus propias filas. */

(function () {
  "use strict";

  const SUPABASE_URL = "https://pgjknwvbzektaqwnyzpp.supabase.co";
  const SUPABASE_KEY = "sb_publishable_DHkOlF8EcyRq-82Zib2v-A__ZZvyQml";
  // Los usuarios entran solo con usuario + contraseña. Internamente lo mapeamos
  // a un email sintético para poder usar Supabase Auth (que trabaja por email).
  // El dominio debe tener un TLD válido: Supabase rechaza dominios como ".local".
  // Nunca se envía correo real a esta dirección.
  const EMAIL_DOMAIN = "nortiasqlacademy.com";

  let client = null;
  let session = null;

  function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
  }

  function emailFor(username) {
    return normalizeUsername(username) + "@" + EMAIL_DOMAIN;
  }

  function friendlyError(error) {
    const msg = (error && error.message ? error.message : String(error)).toLowerCase();
    if (msg.includes("invalid login")) return "Usuario o contraseña incorrectos.";
    if (msg.includes("already registered") || msg.includes("already been registered")) {
      return "Ese nombre de usuario ya está en uso.";
    }
    if (msg.includes("email") && msg.includes("confirm")) {
      return "Falta desactivar la confirmación por email en Supabase (ver instrucciones).";
    }
    if (msg.includes("password")) return "La contraseña debe tener al menos 6 caracteres.";
    return (error && error.message) ? error.message : "Ocurrió un error. Intenta de nuevo.";
  }

  const Backend = {
    // Crea el cliente y recupera la sesión guardada (si el usuario ya entró antes).
    init() {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return client.auth.getSession().then(function (result) {
        session = result.data.session;
        return session;
      });
    },

    getSession: function () { return session; },
    getUserId: function () { return session && session.user ? session.user.id : null; },

    getProfile: async function () {
      const uid = this.getUserId();
      if (!uid) return null;
      const res = await client.from("profiles")
        .select("username, display_name")
        .eq("id", uid)
        .maybeSingle();
      return res.data;
    },

    // El registro lo hace una Edge Function ("signup") del lado servidor: crea el
    // usuario ya confirmado con la service_role key, sin enviar correos. Luego
    // iniciamos sesión normalmente con usuario+contraseña.
    signUp: async function (username, password) {
      const user = normalizeUsername(username);
      let res, body = {};
      try {
        res = await fetch(SUPABASE_URL + "/functions/v1/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
          body: JSON.stringify({ username: user, password: password }),
        });
        body = await res.json();
      } catch (e) {
        throw new Error("No se pudo conectar con el servidor de registro. Revisa tu conexión.");
      }
      if (!res.ok || body.error) {
        throw new Error(body.error || "No se pudo crear la cuenta. Intenta de nuevo.");
      }
      // Cuenta creada y confirmada: iniciar sesión de inmediato.
      await this.signIn(user, password);
      return { needsConfirm: false };
    },

    signIn: async function (username, password) {
      const res = await client.auth.signInWithPassword({
        email: emailFor(username),
        password: password,
      });
      if (res.error) throw new Error(friendlyError(res.error));
      session = res.data.session;
    },

    signOut: async function () {
      await client.auth.signOut();
      session = null;
    },

    // Devuelve el array de module_id que el usuario ya tiene registrados.
    loadProgress: async function () {
      const uid = this.getUserId();
      if (!uid) return [];
      const res = await client.from("progress").select("module_id").eq("user_id", uid);
      if (res.error) { console.warn("progress load:", res.error.message); return []; }
      return res.data.map(function (r) { return r.module_id; });
    },

    // Guarda/actualiza el progreso de un módulo. Fire-and-forget: no bloquea la UI.
    saveProgress: function (moduleId, status) {
      const uid = this.getUserId();
      if (!uid) return;
      client.from("progress").upsert(
        {
          user_id: uid,
          module_id: moduleId,
          status: status || "visitado",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,module_id" }
      ).then(function (res) {
        if (res.error) console.warn("progress save:", res.error.message);
      });
    },

    // Registra un intento de ejercicio. Fire-and-forget.
    logAttempt: function (moduleId, exerciseIndex, sql, success, errorMsg) {
      const uid = this.getUserId();
      if (!uid) return;
      client.from("attempts").insert({
        user_id: uid,
        module_id: moduleId,
        exercise_index: (exerciseIndex === undefined ? null : exerciseIndex),
        sql: sql,
        success: !!success,
        error: errorMsg || null,
      }).then(function (res) {
        if (res.error) console.warn("attempt log:", res.error.message);
      });
    },
  };

  window.NortiaBackend = Backend;
})();
