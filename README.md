# Multisystem Database

Repositorio independiente para gestionar Prisma (schema, migraciones, cliente) de Multisystem.

## Descripción

Este repositorio contiene:
- **Prisma Schema**: Definición de la estructura de la base de datos
- **Migraciones**: Historial de cambios del schema
- **Prisma Client**: Cliente TypeScript exportado para consumo por otros servicios

## Estructura

```
multisystem-database/
├── prisma/
│   ├── schema.prisma      # Schema de Prisma
│   └── migrations/        # Migraciones de BD
├── src/
│   └── client.ts          # Cliente Prisma exportado
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Uso

Este paquete es consumido por `services/api/` mediante dependencia local:

```json
{
  "dependencies": {
    "@multisystem/database": "file:../database"
  }
}
```

```typescript
// En services/api/
import { prisma } from '@multisystem/database'

export async function getProducts() {
  return prisma.product.findMany()
}
```

## Scripts

- `pnpm generate` - Genera Prisma Client
- `pnpm migrate:dev` - Ejecuta migraciones en desarrollo
- `pnpm migrate:deploy` - Ejecuta migraciones en producción
- `pnpm db:push` - Sincroniza schema con BD (desarrollo)
- `pnpm studio` - Abre Prisma Studio

## Migraciones

```bash
cd services/database
pnpm prisma migrate dev --name nombre_migracion
pnpm prisma generate
```

## Variables de Entorno

```bash
DATABASE_URL=postgresql://user:password@postgres:5432/multisystem_db
```
