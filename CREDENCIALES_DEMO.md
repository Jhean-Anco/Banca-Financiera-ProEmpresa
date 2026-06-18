# Credenciales demo — Banco Pichincha (3 aplicaciones)

Proyecto Supabase compartido: `https://uomaqpphyouzbnestbba.supabase.co`

> Si ya ejecutaste `03_usuarios_demo_docente.sql` y creaste los usuarios en **Supabase Auth**, usa las credenciales de la tabla siguiente.

---

## Tabla resumen (usuario y contraseña)

| # | Aplicación | Rol | Usuario | Contraseña | Qué puede hacer |
|---|------------|-----|---------|------------|-----------------|
| 1 | **App Cliente** (`banco_pichincha`) | Cliente | DNI **`40118120`** | **`Docente2025!`** *(al registrarse)* | Solicitar crédito, ver cuentas y créditos |
| 2 | **App Asesor Ventas** (Flutter FV) | Asesor | **`asesor@pichincha.com`** | **`Docente2025!`** | Cartera, ruta, aceptar solicitud, enviar a comité |
| 2b | **App Asesor Ventas** (modo demo) | Asesor | **`demo@pichincha.com`** | **`pichincha123`** | Igual que asesor, sin Supabase Auth |
| 3 | **Web Fuerza de Ventas** | Supervisor | **`supervisor@pichincha.com`** | **`Docente2025!`** | Aprobar / rechazar solicitudes |

---

## 1. App Cliente — `banco_pichincha`

| Campo | Valor |
|-------|--------|
| **Nombre app** | Banco Pichincha |
| **Tipo de login** | DNI + contraseña |
| **Usuario (Caso 1)** | DNI `40118120` |
| **Nombre cliente** | Anaximandro Quispe |
| **Contraseña sugerida** | `Docente2025!` |

**Pasos:** Registrarse en la app con esos datos → **Contratar** → solicitar crédito (ej. S/1000).

**Repo:** https://github.com/Ivan-1926/APP_TEORIA_PICHINCHA

---

## 2. App móvil Fuerza de Ventas — `APP_Fuerza _De_Venta`

| Campo | Valor |
|-------|--------|
| **Nombre app** | Asesor Ventas |
| **Tipo de login** | Correo + contraseña (Supabase Auth) |

### Login real (asesor)

| Usuario | Contraseña |
|---------|------------|
| `asesor@pichincha.com` | `Docente2025!` |

Botón en login: **Ingresar como asesor (Supabase)** o escribir manualmente.

### Modo demo offline

| Usuario | Contraseña |
|---------|------------|
| `demo@pichincha.com` | `pichincha123` |

Botón: **Modo Demo**.

**Repo:** https://github.com/Ivan-1926/Teoria_Fuerza_de_venta

---

## 3. Web supervisor — `fuerza-ventas-web`

| Campo | Valor |
|-------|--------|
| **URL local** | http://localhost:5173/login |
| **Tipo de login** | Correo + contraseña (Supabase Auth) |

### Login supervisor (aprobar / rechazar)

| Usuario | Contraseña |
|---------|------------|
| `supervisor@pichincha.com` | `Docente2025!` |

Tras ingresar → menú **Solicitudes** → **Aprobar** / **Rechazar**.

Botón en login: **Rellenar credenciales demo**.

**Arranque:**

```powershell
cd fuerza-ventas-web
npm install
copy .env.example .env
npm run dev
```

**Repo:** https://github.com/Ivan-1926/web_fuerza_de_venta

---

## Roles (RBAC)

| Rol | App | Permisos |
|-----|-----|----------|
| **cliente** | App Cliente | Crear solicitud de crédito |
| **asesor** | App móvil FV | Ver cartera, aceptar solicitud, enviar a comité |
| **supervisor** | Web FV | Aprobar / rechazar solicitudes |
| **admin** | Web / BD | Igual que supervisor |

---

## Scripts SQL (orden)

| # | Archivo | Repo |
|---|---------|------|
| 1 | `supabase/schema_and_seed.sql` | APP_Fuerza _De_Venta |
| 2 | `supabase/02_rubrica_integracion.sql` | APP_Fuerza _De_Venta |
| 3 | `supabase/03_usuarios_demo_docente.sql` | APP_Fuerza _De_Venta |
| 4 | `supabase/02_rubrica_integracion.sql` | banco_pichincha |
| 5 | `supabase/03_fix_registro.sql` | banco_pichincha |
| 6 | `supabase/04_cliente_solicitud_credito.sql` | banco_pichincha |

**Supabase Auth → Users** (crear manualmente):

- `supervisor@pichincha.com` / `Docente2025!`
- `asesor@pichincha.com` / `Docente2025!`

Desactivar confirmación de email en desarrollo.

---

## Flujo demo Caso 1

1. **Cliente** (`40118120`) solicita crédito en app cliente.
2. **Asesor** (`asesor@pichincha.com` o demo) acepta y envía a comité en app móvil.
3. **Supervisor** (`supervisor@pichincha.com`) aprueba en la web.
4. **Cliente** refresca inicio → aparece el crédito (E2E vía `sync_outbox`).
