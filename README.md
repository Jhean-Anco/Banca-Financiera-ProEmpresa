# Fuerza de Ventas Web — Banco Pichincha

Dashboard web conectado al **mismo Supabase** que la app Flutter de Fuerza de Ventas.

## Stack

- React 19 + Vite
- Supabase JS (lectura de tablas y vista KPI)
- Tipografía **Plus Jakarta Sans**
- Paleta Banco Pichincha (azul `#003DA5`, amarillo `#FFD100`)

## Instalación

```bash
cd fuerza-ventas-web
npm install
cp .env.example .env
# Editar .env con tu URL y anon key de Supabase
npm run dev
```

Abre http://localhost:5173

## Sincronización con las apps Flutter (un solo Supabase)

La web ahora lee y escribe las **mismas tablas** que las apps Flutter, en el
**mismo proyecto** Supabase (`uomaqpphyouzbnestbba.supabase.co`):

| Vista web | Tabla compartida | App que la origina |
|-----------|------------------|--------------------|
| Cartera | `clients` | App FV (campo) |
| Solicitudes | `credit_applications` | App FV (campo) |
| Trazabilidad E2E | `sync_log` / `sync_outbox` | Trigger al aprobar |

> Las tablas se crean con los scripts del proyecto Flutter de Fuerza de Ventas:
> `APP_Fuerza _De_Venta/supabase/schema_and_seed.sql` y
> `APP_Fuerza _De_Venta/supabase/02_rubrica_integracion.sql`.
> Los scripts antiguos de `supabase/scripts/` (esquema `creditos_preaprobados`)
> quedan obsoletos para evitar dos modelos paralelos.

## Integración End-to-End (Criterio 1)

1. La app de campo origina la solicitud → `credit_applications`.
2. El **supervisor** la ve en **Solicitudes** y pulsa **Aprobar**.
3. Eso pone `status = 'aprobado'`, lo que dispara el trigger
   `trg_fv_publicar_aprobacion` → publica el evento en `sync_outbox`.
4. La app del cliente (`banco_pichincha`) lo consume con
   `rpc_procesar_sync_outbox` y refleja el crédito.
5. La sección **Integración End-to-End** muestra la traza desde `sync_log`.

## RBAC

El usuario de la sesión (`Layout.jsx`) tiene `rol: 'supervisor'`, por lo que
puede **aprobar/rechazar**. Un `rol: 'asesor'` no vería esas acciones.

## Modo demo

Sin `.env` configurado, la web muestra datos mock locales coherentes con el
esquema unificado.

## Build producción

```bash
npm run build
npm run preview
```

Despliega la carpeta `dist/` en Vercel, Netlify o servidor estático.

## Seguridad

Las políticas RLS del script 03 son **abiertas para desarrollo**. En producción restringe por `auth.uid()` o rol de asesor.
