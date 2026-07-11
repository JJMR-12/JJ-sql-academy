/* Lógica de la aplicación: arranca sql.js, arma el menú y conecta los ejercicios. */

(function () {
  "use strict";

  const CATEGORY_ORDER = ["Fundamentos", "Básico", "Intermedio", "Avanzado", "Profesional"];
  const PROGRESS_KEY = "sqlAcademy_progress_v1";

  let db = null;
  let initialSnapshot = null;
  let currentId = "home";
  let visited = new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]"));

  const el = {
    loading: document.getElementById("loading-screen"),
    app: document.getElementById("app"),
    sidebarNav: document.getElementById("sidebar-nav"),
    content: document.getElementById("module-container"),
    topTitle: document.getElementById("top-title"),
    topBadge: document.getElementById("top-badge"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    moduleNavBottom: document.getElementById("module-nav-bottom"),
    brandBtn: document.getElementById("brand-btn"),
    resetDbBtn: document.getElementById("reset-db-btn"),
    playgroundBtn: document.getElementById("playground-btn"),
    schemaBtn: document.getElementById("schema-btn"),
    schemaModal: document.getElementById("schema-modal"),
    schemaClose: document.getElementById("schema-close"),
    schemaBody: document.getElementById("schema-body"),
    toast: document.getElementById("toast"),
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.toast.classList.remove("visible"), 2600);
  }

  // ---------- Base de datos ----------

  function initDatabase(SQL) {
    db = new SQL.Database();
    db.run(buildSetupSQL());
    initialSnapshot = db.export();
  }

  function resetDatabase() {
    db = new (db.constructor)(new Uint8Array(initialSnapshot));
    showToast("Base de datos reiniciada a su estado original.");
  }

  function runSQL(sqlText) {
    try {
      const res = db.exec(sqlText);
      const rowsModified = db.getRowsModified();
      return { ok: true, res, rowsModified };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }

  function renderResult(container, outcome) {
    container.innerHTML = "";
    if (!outcome.ok) {
      const div = document.createElement("div");
      div.className = "result-error";
      div.textContent = "Error: " + outcome.error;
      container.appendChild(div);
      return;
    }
    if (!outcome.res || outcome.res.length === 0) {
      const div = document.createElement("div");
      div.className = "result-ok";
      const modText = outcome.rowsModified > 0 ? ` (${outcome.rowsModified} fila(s) afectada(s))` : "";
      div.textContent = "Consulta ejecutada correctamente." + modText;
      container.appendChild(div);
      return;
    }
    outcome.res.forEach((set) => {
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      set.columns.forEach((c) => {
        const th = document.createElement("th");
        th.textContent = c;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      set.values.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((val) => {
          const td = document.createElement("td");
          td.textContent = val === null ? "NULL" : val;
          if (val === null) td.classList.add("cell-null");
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      const meta = document.createElement("div");
      meta.className = "result-meta";
      meta.textContent = `${set.values.length} fila(s)`;
      wrap.appendChild(meta);
      container.appendChild(wrap);
    });
  }

  // ---------- Sidebar ----------

  function buildSidebar() {
    el.sidebarNav.innerHTML = "";

    const homeBtn = document.createElement("button");
    homeBtn.className = "nav-item nav-home";
    homeBtn.dataset.id = "home";
    homeBtn.innerHTML = `<span class="nav-icon">🏠</span><span>Inicio</span>`;
    el.sidebarNav.appendChild(homeBtn);

    CATEGORY_ORDER.forEach((cat) => {
      const mods = MODULES.filter((m) => m.categoria === cat);
      if (mods.length === 0) return;
      const label = document.createElement("div");
      label.className = "nav-category";
      label.textContent = cat;
      el.sidebarNav.appendChild(label);
      mods.forEach((m) => {
        const btn = document.createElement("button");
        btn.className = "nav-item";
        btn.dataset.id = m.id;
        btn.innerHTML = `<span class="nav-check">${visited.has(m.id) ? "✓" : m.numero}</span><span>${escapeHtml(m.titulo)}</span>`;
        el.sidebarNav.appendChild(btn);
      });
    });

    el.sidebarNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-item");
      if (!btn) return;
      selectSection(btn.dataset.id);
    });
  }

  function updateSidebarActive() {
    el.sidebarNav.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === currentId);
      const mod = MODULES.find((m) => m.id === btn.dataset.id);
      const check = btn.querySelector(".nav-check");
      if (mod && check) check.textContent = visited.has(mod.id) ? "✓" : mod.numero;
    });
    if (el.playgroundBtn) el.playgroundBtn.classList.toggle("active", currentId === "playground");
  }

  // ---------- Render de módulo ----------

  function renderHome() {
    el.topTitle.textContent = "Aprendamos SQL";
    el.topBadge.textContent = "Bienvenida";
    el.content.innerHTML = `
      <section class="home-hero">
        <h2 class="home-title">Aprendamos SQL</h2>
        <p class="home-subtitle">
          Un curso práctico, paso a paso, para aprender SQL escribiendo y ejecutando consultas
          reales contra una base de datos de ejemplo — desde los fundamentos hasta nivel profesional.
        </p>
        <button class="btn btn-primary btn-start" data-action="start-course">Iniciar →</button>
      </section>
    `;
  }

  function renderPlayground() {
    el.topTitle.textContent = "Playground SQL libre";
    el.topBadge.textContent = "Explora libremente";
    el.content.innerHTML = `
      <section class="module">
        <p class="module-lead">
          Este es un espacio libre para practicar sin ejercicio guiado: escribe cualquier consulta
          SQL contra la base de datos de ejemplo ("Nortia Comercial") y ejecútala. Usa el botón
          <strong>"Ver esquema"</strong> arriba para repasar las tablas y columnas disponibles.
        </p>
        <div class="exercise-block">
          <textarea class="sql-input" id="playground-input" spellcheck="false" placeholder="SELECT * FROM empleados;">SELECT * FROM empleados;</textarea>
          <div class="exercise-actions">
            <button class="btn btn-primary" data-action="run-playground">Ejecutar</button>
          </div>
          <div class="result-area" id="playground-result"></div>
        </div>
      </section>
    `;
  }

  function renderModule(mod) {
    el.topTitle.textContent = `${mod.numero}. ${mod.titulo}`;
    el.topBadge.textContent = mod.categoria;

    const exerciseHtml = mod.ejercicios
      .map((ex, i) => {
        const inputId = `ex-input-${mod.id}-${i}`;
        const resultId = `ex-result-${mod.id}-${i}`;
        const solId = `ex-sol-${mod.id}-${i}`;
        const solResultId = `ex-sol-result-${mod.id}-${i}`;
        return `
        <div class="exercise-block">
          <div class="exercise-head">
            <span class="exercise-title">Ejercicio ${i + 1}: ${escapeHtml(ex.titulo)}</span>
          </div>
          <p class="exercise-prompt">${escapeHtml(ex.enunciado)}</p>
          <textarea class="sql-input" id="${inputId}" spellcheck="false" placeholder="-- escribe tu consulta aquí"></textarea>
          <div class="exercise-actions">
            <button class="btn btn-primary" data-action="run-exercise" data-input="${inputId}" data-result="${resultId}">Ejecutar</button>
            <button class="btn btn-secondary" data-action="toggle-solution" data-target="${solId}" data-sol-result="${solResultId}" data-sql="${encodeURIComponent(ex.solucion)}">Ver solución</button>
          </div>
          <div class="result-area" id="${resultId}"></div>
          <div class="solution-block hidden" id="${solId}">
            <div class="solution-label">Solución</div>
            <pre class="solution-code"><code>${escapeHtml(ex.solucion)}</code></pre>
            <div class="result-area" id="${solResultId}"></div>
          </div>
        </div>`;
      })
      .join("");

    el.content.innerHTML = `
      <section class="module">
        <div class="module-body">${mod.contenido}</div>

        <h3 class="section-heading">Ejemplo resuelto</h3>
        <p class="module-lead">${escapeHtml(mod.ejemplo.descripcion)}</p>
        <div class="exercise-block">
          <pre class="solution-code"><code>${escapeHtml(mod.ejemplo.sql)}</code></pre>
          <div class="exercise-actions">
            <button class="btn btn-primary" data-action="run-example" data-sql="${encodeURIComponent(mod.ejemplo.sql)}" data-result="example-result-${mod.id}">Ejecutar ejemplo</button>
          </div>
          <div class="result-area" id="example-result-${mod.id}"></div>
        </div>

        <h3 class="section-heading">Ejercicios de práctica</h3>
        ${exerciseHtml}
      </section>
    `;
  }

  // ---------- Navegación ----------

  function selectSection(id) {
    currentId = id;
    if (id !== "playground" && id !== "home") {
      visited.add(id);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...visited]));
    }
    updateSidebarActive();

    if (id === "home") {
      renderHome();
    } else if (id === "playground") {
      renderPlayground();
    } else {
      const mod = MODULES.find((m) => m.id === id);
      renderModule(mod);
    }
    updatePrevNext();
    el.content.scrollTop = 0;
    window.scrollTo(0, 0);
    location.hash = id;
  }

  function updatePrevNext() {
    if (currentId === "home") {
      el.moduleNavBottom.classList.add("hidden");
      return;
    }
    el.moduleNavBottom.classList.remove("hidden");
    if (currentId === "playground") {
      el.prevBtn.disabled = true;
      el.nextBtn.disabled = false;
      el.nextBtn.textContent = "Empezar el curso →";
      return;
    }
    const idx = MODULES.findIndex((m) => m.id === currentId);
    el.prevBtn.disabled = idx <= 0;
    el.prevBtn.textContent = "← Anterior";
    el.nextBtn.disabled = idx >= MODULES.length - 1;
    el.nextBtn.textContent = idx >= MODULES.length - 1 ? "Fin del curso" : "Siguiente →";
  }

  el.prevBtn.addEventListener("click", () => {
    if (currentId === "playground" || currentId === "home") return;
    const idx = MODULES.findIndex((m) => m.id === currentId);
    if (idx > 0) selectSection(MODULES[idx - 1].id);
  });

  el.nextBtn.addEventListener("click", () => {
    if (currentId === "playground") {
      selectSection(MODULES[0].id);
      return;
    }
    const idx = MODULES.findIndex((m) => m.id === currentId);
    if (idx < MODULES.length - 1) selectSection(MODULES[idx + 1].id);
  });

  // ---------- Delegación de eventos en el contenido ----------

  el.content.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "start-course") {
      selectSection("playground");
    }

    if (action === "run-playground") {
      const input = document.getElementById("playground-input");
      const result = document.getElementById("playground-result");
      renderResult(result, runSQL(input.value));
    }

    if (action === "run-example") {
      const sql = decodeURIComponent(btn.dataset.sql);
      const result = document.getElementById(btn.dataset.result);
      renderResult(result, runSQL(sql));
    }

    if (action === "run-exercise") {
      const input = document.getElementById(btn.dataset.input);
      const result = document.getElementById(btn.dataset.result);
      renderResult(result, runSQL(input.value));
    }

    if (action === "toggle-solution") {
      const target = document.getElementById(btn.dataset.target);
      const isHidden = target.classList.contains("hidden");
      target.classList.toggle("hidden");
      btn.textContent = isHidden ? "Ocultar solución" : "Ver solución";
      if (isHidden) {
        const sql = decodeURIComponent(btn.dataset.sql);
        const solResult = document.getElementById(btn.dataset.solResult);
        renderResult(solResult, runSQL(sql));
      }
    }
  });

  // ---------- Esquema (modal) ----------

  function buildSchemaModal() {
    const rows = SCHEMA_DESCRIPTION.map(
      (t) => `<tr><td class="schema-table-name">${escapeHtml(t.tabla)}</td><td>${escapeHtml(t.columnas)}</td></tr>`
    ).join("");
    el.schemaBody.innerHTML = `
      <table class="schema-table">
        <thead><tr><th>Tabla</th><th>Columnas</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <h4>Definición SQL completa</h4>
      <pre class="solution-code"><code>${escapeHtml(SCHEMA_SQL.trim())}</code></pre>
    `;
  }

  el.schemaBtn.addEventListener("click", () => el.schemaModal.classList.remove("hidden"));
  el.schemaClose.addEventListener("click", () => el.schemaModal.classList.add("hidden"));
  el.schemaModal.addEventListener("click", (e) => {
    if (e.target === el.schemaModal) el.schemaModal.classList.add("hidden");
  });

  el.resetDbBtn.addEventListener("click", () => {
    resetDatabase();
  });

  el.playgroundBtn.addEventListener("click", () => selectSection("playground"));

  if (el.brandBtn) {
    el.brandBtn.addEventListener("click", () => selectSection("home"));
    el.brandBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectSection("home");
      }
    });
  }

  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      el.app.classList.toggle("sidebar-open");
      el.app.classList.toggle("sidebar-collapsed");
    });
  }
  el.sidebarNav.addEventListener("click", () => {
    el.app.classList.remove("sidebar-open");
  });

  // ---------- Arranque ----------

  function boot() {
    buildSidebar();
    buildSchemaModal();
    const initialId = location.hash ? location.hash.slice(1) : "home";
    const valid = initialId === "home" || initialId === "playground" || MODULES.some((m) => m.id === initialId);
    selectSection(valid ? initialId : "home");

    el.loading.classList.add("hidden");
    el.app.classList.remove("hidden");
  }

  function showLoadError(err) {
    el.loading.innerHTML = `
      <div class="loading-box">
        <p><strong>No se pudo cargar el motor SQL (sql.js).</strong></p>
        <p>Esta página necesita conexión a internet la primera vez, para descargar el motor
        SQLite que corre en el navegador. Verifica tu conexión y recarga la página.</p>
        <p class="loading-error">${escapeHtml(err && err.message ? err.message : String(err))}</p>
      </div>`;
  }

  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (!id) return;
    const valid = id === "home" || id === "playground" || MODULES.some((m) => m.id === id);
    if (valid && id !== currentId) selectSection(id);
  });

  window.addEventListener("DOMContentLoaded", () => {
    if (typeof initSqlJs !== "function") {
      showLoadError(new Error("El script de sql.js no se cargó."));
      return;
    }
    initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
    })
      .then((SQL) => {
        initDatabase(SQL);
        boot();
      })
      .catch(showLoadError);
  });
})();
