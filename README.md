# Financiera ProEmpresa - Web Administrador

Dashboard web conectado al mismo Supabase que la app cliente y la app del
trabajador de campo.

## Base de datos

Ejecutar en Supabase SQL Editor, desde `../supabase_unified`:

1. `00_reset_database.sql`
2. `01_create_database.sql`
3. `02_seed_data.sql`

Si la base ya existe y no se desea resetear datos, ejecutar adicionalmente:

- `03_update_storage_documents.sql`

No ejecutar SQL dentro de esta web. Todos los scripts locales anteriores fueron
consolidados.

## Credenciales demo

| Rol | Email | Contrasena |
| --- | --- | --- |
| Supervisor | `supervisor@proempresa.com` | `Docente2025!` |
| Admin | `admin@proempresa.com` | `Docente2025!` |

## Flujo

1. El cliente solicita prestamo desde la app cliente.
2. La web valida y asigna trabajador de campo.
3. La app del trabajador levanta datos y envia a comite.
4. La web aprueba o rechaza.
5. Al aprobar, la solicitud pasa a `desembolsado` y se publica en `sync_outbox`.

## Ejecutar

```bash
npm install
npm run dev
```
