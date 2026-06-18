# Credenciales y roles — Demo docente

Proyecto Supabase compartido: `https://uomaqpphyouzbnestbba.supabase.co`

## Scripts SQL (orden en Supabase → SQL Editor)

| # | Archivo | Repo |
|---|---------|------|
| 1 | `supabase/schema_and_seed.sql` | APP_Fuerza _De_Venta |
| 2 | `supabase/02_rubrica_integracion.sql` | APP_Fuerza _De_Venta |
| 3 | `supabase/03_usuarios_demo_docente.sql` | APP_Fuerza _De_Venta |
| 4 | `supabase/02_rubrica_integracion.sql` | banco_pichincha |
| 5 | `supabase/03_fix_registro.sql` | banco_pichincha |
| 6 | `supabase/04_cliente_solicitud_credito.sql` | banco_pichincha |

En **Authentication → Providers**: desactivar confirmación de email (desarrollo).

---

## Credenciales por aplicación

### 1. Web supervisor (`fuerza-ventas-web`)

| Campo | Valor |
|-------|--------|
| **Login** | No hay pantalla de login (sesión demo fija) |
| **Usuario mostrado** | Carlos Ramírez — **Supervisor** |
| **Acciones** | Aprobar / Rechazar en **Solicitudes** |
| **URL local** | http://localhost:5173 |

Requisitos: Node.js LTS, `npm install`, archivo `.env` (ver README).

---

### 2. App móvil Fuerza de Ventas (`APP_Fuerza _De_Venta`)

| Email | Contraseña | Rol | Uso |
|-------|------------|-----|-----|
| `demo@pichincha.com` | `pichincha123` | **asesor** | Demo rápida (botón en login). Aceptar solicitudes y enviar a comité. |
| `asesor@pichincha.com` | `Docente2025!` | **asesor** | Tras crear usuario en Supabase Auth + script SQL |
| `supervisor@pichincha.com` | `Docente2025!` | **supervisor** | Solo si inicia sesión en móvil; en demo normal el supervisor usa la **web** |

---

### 3. App cliente (`banco_pichincha`)

| Campo | Valor Caso 1 (PDF) |
|-------|---------------------|
| **Registro** | DNI `40118120`, nombre **Anaximandro Quispe**, correo y clave libres |
| **Login** | **DNI** `40118120` + la contraseña elegida al registrarse |
| **Sugerido docente** | Clave `Docente2025!` al registrar el Caso 1 |

Flujo: **Contratar** → producto crédito → monto S/1000 (o el del caso).

---

## Roles (RBAC)

| Rol | Dónde | Permisos demo |
|-----|--------|----------------|
| **cliente** | App banco_pichincha | Crear solicitud de crédito |
| **asesor** | App móvil FV | Cartera, ruta, buró, **aceptar** solicitud, **enviar a comité** |
| **supervisor** | Web FV | **Aprobar** / **Rechazar** solicitudes |
| **admin** | BD (opcional) | Igual que supervisor en políticas RLS |

---

## Flujo demo Caso 1 (8 pasos resumidos)

1. Cliente (`40118120`) solicita crédito en app cliente.
2. Asesor (`demo@pichincha.com`) ve solicitud → **Aceptar** → **Enviar a comité**.
3. Supervisor abre web → **Solicitudes** → **Aprobar**.
4. Cliente refresca inicio → aparece crédito (vía `sync_outbox`).

---

## Repositorios GitHub

| App | Repo |
|-----|------|
| Cliente | https://github.com/Ivan-1926/APP_TEORIA_PICHINCHA |
| Fuerza de Ventas (Flutter) | https://github.com/Ivan-1926/Teoria_Fuerza_de_venta |
| Web supervisor | https://github.com/Ivan-1926/web_fuerza_de_venta |
