# Credenciales demo - Financiera ProEmpresa

## SQL unico

Ejecutar solo estos tres scripts desde `supabase_unified`:

1. `00_reset_database.sql`
2. `01_create_database.sql`
3. `02_seed_data.sql`

No ejecutar scripts SQL dentro de las apps. Fueron eliminados y consolidados.

## Usuarios

Todos usan la contrasena `Docente2025!`.

| Aplicacion | Rol | Usuario | Documento |
| --- | --- | --- | --- |
| App Cliente | Cliente | `cliente@proempresa.com` | `72345678` |
| App Cliente | Cliente | `cliente2@proempresa.com` | `73456789` |
| App trabajador | Asesor | `asesor@proempresa.com` | - |
| App trabajador | Asesor | `asesor2@proempresa.com` | - |
| Web administrador | Supervisor | `supervisor@proempresa.com` | - |
| Web administrador | Admin | `admin@proempresa.com` | - |

## Flujo demo

1. Cliente entra con DNI `72345678` y solicita un prestamo.
2. Supervisor web valida y asigna un asesor.
3. La app del asesor muestra la solicitud, visita y ficha.
4. El asesor envia a comite.
5. Supervisor aprueba o rechaza desde web.
6. Si aprueba, la solicitud queda `desembolsado`.
7. App cliente procesa `sync_outbox` y muestra credito, cuotas, movimiento,
   saldo y notificacion.
