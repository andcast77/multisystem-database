# Notas de Migración de Prisma

## IMPORTANTE: Pasos Pendientes

Este directorio (`services/database/`) está preparado pero necesita que se mueva Prisma desde `services/api/`.

### Pasos a Realizar:

1. **Inicializar submodule `services/api/`** (si no está inicializado):
   ```bash
   git submodule update --init services/api
   ```

2. **Mover archivos de Prisma desde `services/api/` a `services/database/`**:
   - `services/api/prisma/schema.prisma` → `services/database/prisma/schema.prisma`
   - `services/api/prisma/migrations/` → `services/database/prisma/migrations/`
   - Buscar código del cliente Prisma en `services/api/src/` → mover a `services/database/src/client.ts` (o actualizar si ya existe)

3. **Actualizar `services/api/package.json`**:
   - Eliminar dependencias de `@prisma/client` y `prisma` (si están directamente)
   - Agregar: `"@multisystem/database": "file:../database"`

4. **Actualizar imports en `services/api/`**:
   - Cambiar: `import { prisma } from './lib/prisma'` (o similar)
   - A: `import { prisma } from '@multisystem/database'`

5. **Eliminar de `services/api/`**:
   - Carpeta `prisma/` completa

6. **Crear repositorio Git** `multisystem-database` en GitHub/GitLab

7. **Agregar como submodule**:
   ```bash
   # Primero inicializar Git en este directorio (si no es submodule aún)
   cd services/database
   git init
   git add .
   git commit -m "Initial commit: Prisma database package"
   git remote add origin https://github.com/andcast77/multisystem-database.git
   git push -u origin main
   
   # Luego agregar como submodule desde multisystem/
   cd ../..
   git submodule add https://github.com/andcast77/multisystem-database.git services/database
   ```

### Después de la Migración:

- Eliminar este archivo (`MIGRATION_NOTES.md`)
- Eliminar `.gitkeep` si existe
