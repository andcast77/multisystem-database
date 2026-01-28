# Multisystem Database

Servicio Prisma + **Neon** (Postgres serverless): schema, migraciones y cliente. Configurado según [Prisma + Neon](https://www.prisma.io/docs/orm/overview/databases/neon) y [Neon Prisma guide](https://neon.com/docs/guides/prisma).

## Contenido

- **Prisma Schema**: Definición de la base de datos
- **Migraciones**: `prisma/migrations`
- **Cliente**: Generado en `generated/prisma`, exportado vía `src/client.ts` usando `@prisma/adapter-neon` (driver serverless de Neon)

## Estructura

```
services/database/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── generated/
│   └── prisma/
├── src/
│   └── client.ts
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

## Uso

```json
{
  "dependencies": {
    "@multisystem/database": "workspace:*"
  }
}
```

```typescript
import { prisma } from '@multisystem/database'

const users = await prisma.user.findMany()
```

## Scripts

| Comando | Descripción |
|--------|-------------|
| `pnpm generate` | Genera Prisma Client |
| `pnpm migrate:dev` | Migraciones en desarrollo |
| `pnpm migrate:deploy` | Migraciones en producción |
| `pnpm db:push` | Sincroniza schema con BD |
| `pnpm studio` | Prisma Studio |

## Variables de entorno (Neon)

En `.env` en la raíz del servicio:

```bash
# Pooled (Prisma Client en runtime). Usar URL con -pooler en el host.
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require

# Directa (Prisma CLI: migrate, studio, etc.). Sin -pooler.
DIRECT_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

- **DATABASE_URL**: conexión **pooled** (`-pooler`), usada por el cliente en la API.
- **DIRECT_URL**: conexión **directa**, usada por `prisma migrate`, `prisma studio`, etc. Si no existe, el CLI usa `DATABASE_URL`.

`pnpm generate` no necesita BD; migrate/studio requieren al menos una de las dos en `.env`. Ambas en [Neon Console](https://console.neon.tech) → Connect. Opcional: `?sslmode=require&connect_timeout=10` para evitar timeouts en cold start.

## Migraciones

```bash
cd services/database
pnpm migrate:dev --name nombre_migracion
pnpm generate
```

## Referencias

- [Prisma + Neon](https://www.prisma.io/docs/orm/overview/databases/neon)
- [Neon – Connect from Prisma](https://neon.com/docs/guides/prisma)
