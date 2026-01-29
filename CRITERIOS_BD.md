# Criterios Unificados de Base de Datos

Este documento establece los criterios unificados para la base de datos compartida entre **Workify** y **Shopflow**.

## Objetivo

Unificar todos los criterios de base de datos (schema Prisma, convenciones de nombres, tipos de datos, configuración) en un único schema centralizado en `services/database/prisma/schema.prisma`, estableciendo estándares consistentes para ambos módulos.

## Arquitectura

```
┌─────────────────┐
│   Frontends     │  (workify, shopflow, hub)
│   (Next.js)     │
└────────┬────────┘
         │ HTTP Requests
         │ (NEXT_PUBLIC_API_URL)
         ▼
┌─────────────────┐
│   API Principal │  (services/api)
│   (Puerto 3001) │
└────────┬────────┘
         │ HTTP Requests
         │ (DATABASE_API_URL)
         ▼
┌─────────────────┐
│  Database API   │  (services/database)
│  (Puerto 3002)  │
└────────┬────────┘
         │ Prisma Client
         │ (DATABASE_URL)
         ▼
┌─────────────────┐
│   PostgreSQL    │  (Neon)
│   (Serverless)   │
└─────────────────┘
```

**Principios**:
- ✅ Solo `services/database` accede directamente a PostgreSQL usando Prisma
- ✅ Los frontends consumen la API por HTTP
- ✅ La API Principal consume Database API por HTTP
- ✅ Un único schema Prisma con todos los modelos

## Schema Prisma Unificado

### Ubicación

`services/database/prisma/schema.prisma`

### Modelos Incluidos

#### Modelos Compartidos
- `User` - Usuario unificado con estructura de Workify + compatibilidad Shopflow
- `Company` - Empresa con jerarquía (Workify)
- `Notification` - Notificaciones unificadas (estructura Shopflow + companyId opcional)

#### Modelos Workify (20+ modelos)
- **Estructura Organizacional**: `Department`, `Position`
- **Usuarios y Permisos**: `Role`, `Permission`, `UserRole`, `UserPermission`, `RolePermission`
- **Empleados**: `Employee`, `TimeEntry`
- **Nómina**: `Payroll`, `PayrollRule`, `License`, `LicensePolicy`
- **Asistencia**: `WorkShift`, `Schedule`, `SpecialDayAssignment`, `Holiday`
- **Documentos**: `Document`
- **Auditoría**: `AuditLog`, `IntegrationLog`
- **Reportes**: `Report`
- **Multi-idioma**: `Translation`

#### Modelos Shopflow (16+ modelos)
- **Productos**: `Product`, `Category`, `Supplier`
- **Ventas**: `Sale`, `SaleItem`, `Customer`
- **Configuración**: `StoreConfig`, `TicketConfig`, `UserPreferences`
- **Inventario**: `InventoryTransfer`
- **Fidelidad**: `LoyaltyConfig`, `LoyaltyPoint`
- **Notificaciones**: `NotificationPreference`
- **Auditoría**: `ActionHistory`

## Convenciones de Nombres

Ver [CONVENTIONS.md](./CONVENTIONS.md) para detalles completos.

### Resumen

1. **Tablas**: snake_case, plural (`users`, `sale_items`, `time_entries`)
2. **Campos**: camelCase (`firstName`, `lastName`, `createdAt`)
3. **Booleanos**: Prefijo `is` (`isActive`, `isDeleted`, `isRead`)
4. **Fechas**: `createdAt`, `updatedAt`, `deletedAt`
5. **Enums**: UPPER_SNAKE_CASE (`ACTIVE`, `PENDING`, `COMPLETED`)
6. **Relaciones**: Singular para uno, plural para muchos

## Tipos de Datos Estándar

### Decimales

- **Monedas**: `Decimal @db.Decimal(10, 2)` - 10 dígitos totales, 2 decimales
- **Porcentajes**: `Decimal @db.Decimal(5, 4)` - 5 dígitos totales, 4 decimales
- **Multiplicadores**: `Decimal @db.Decimal(5, 2)` - 5 dígitos totales, 2 decimales

**Ejemplos**:
```prisma
price       Decimal @db.Decimal(10, 2)  // Precio de producto
taxRate     Decimal @db.Decimal(5, 4)   // Tasa de impuesto
pointsPerDollar Decimal @db.Decimal(10, 2)  // Puntos por dólar
```

### Strings

- **Opcionales**: `String?` para campos opcionales
- **Requeridos**: `String` para campos requeridos
- **Únicos**: `@unique` cuando corresponda

### JSON

- **Estructurado**: Usar `Json` para datos estructurados (no `String` con JSON)
- **Campos comunes**: `data`, `preferences`, `config`, `before`, `after`, `details`

**Ejemplos**:
```prisma
data        Json?  // Datos de notificación
preferences Json?  // Preferencias de usuario
config      Json?  // Configuración de reporte
before      Json?  // Estado anterior (audit log)
after       Json?  // Estado nuevo (audit log)
details     Json?  // Detalles de acción (action history)
```

### Fechas

- **DateTime**: Siempre usar `DateTime` para fechas
- **Defaults**: 
  - `@default(now())` para creación
  - `@updatedAt` para actualización automática

**Campos estándar**:
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `deletedAt DateTime?` (para soft delete)
- `expiresAt DateTime?` (para expiración)
- `readAt DateTime?` (para lectura)

## Estructura de Modelos Compartidos

### User (Unificado)

**Estructura**: Basada en Workify (más completa) + compatibilidad Shopflow

```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  firstName         String   // De Workify
  lastName          String   // De Workify
  phone             String?  // De Workify
  role              UserRole @default(USER)  // De Shopflow
  isActive          Boolean  @default(true)  // De Workify (no "active")
  twoFactorEnabled  Boolean  @default(false) // De Workify
  twoFactorSecret   String?  // De Workify
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relaciones Workify
  userRoles         UserRole[]
  userPermissions   UserPermission[]
  employees         Employee[]
  
  // Relaciones Shopflow
  sales             Sale[]
  actionHistory     ActionHistory[]
  notifications     Notification[]
  userPreferences   UserPreferences?
  inventoryTransfers InventoryTransfer[]
}
```

**Decisiones**:
- ✅ Usar `firstName`/`lastName` (no `name`)
- ✅ Usar `isActive` (no `active`)
- ✅ Mantener `role` para compatibilidad con Shopflow
- ✅ Agregar campos de Workify (`phone`, `twoFactorEnabled`, `twoFactorSecret`)

### Company

**Estructura**: Basada en Workify con jerarquía

```prisma
model Company {
  id          String   @id @default(uuid())
  name        String   @unique  // Único
  parentId    String?  // Jerarquía opcional
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Jerarquía
  parent      Company?  @relation("CompanyHierarchy", fields: [parentId], references: [id])
  children    Company[] @relation("CompanyHierarchy")
  
  // Relaciones
  departments Department[]
  roles       Role[]
  employees   Employee[]
  // ... más relaciones
}
```

**Decisiones**:
- ✅ `name` debe ser `@unique`
- ✅ `parentId` opcional para jerarquía
- ✅ Todas las relaciones de Workify

### Notification (Unificado)

**Estructura**: Basada en Shopflow (más completa) + `companyId` opcional para Workify

```prisma
model Notification {
  id          String            @id @default(uuid())
  userId      String
  companyId   String?           // Opcional para Workify
  type        NotificationType
  priority    NotificationPriority @default(MEDIUM)  // De Shopflow
  title       String
  message     String
  data        Json?             // JSON estructurado (no String)
  actionUrl   String?           // De Shopflow
  status      NotificationStatus @default(UNREAD)  // De Shopflow
  expiresAt   DateTime?         // De Shopflow
  readAt      DateTime?         // De Shopflow
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  user        User              @relation(fields: [userId], references: [id])
  company     Company?          @relation(fields: [companyId], references: [id])
}
```

**Decisiones**:
- ✅ Usar estructura de Shopflow (más completa)
- ✅ Agregar `companyId` opcional para Workify
- ✅ Usar `Json` para `data` (no `String`)
- ✅ Usar `status` y `readAt` (no solo `isRead`)

## Enums Unificados

### Enums Compartidos

```prisma
enum UserRole {
  USER
  ADMIN
  SUPERADMIN
}

enum SaleStatus {
  PENDING
  COMPLETED
  CANCELLED
  REFUNDED  // Agregado para Shopflow
}

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
  CHECK      // Agregado para Shopflow
  OTHER
}

enum NotificationType {
  INFO
  WARNING
  ERROR
  SUCCESS
  LOW_STOCK           // Shopflow
  IMPORTANT_SALE      // Shopflow
  PENDING_TASK        // Shopflow
}
```

### Enums Workify

```prisma
enum SalaryType {
  HOUR
  DAY
  WEEK
  BIWEEK
  MONTH
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum PayrollStatus {
  PENDING
  APPROVED
  REJECTED
}

enum LicenseType {
  VACATION
  SICK_LEAVE
  PERSONAL_LEAVE
  UNPAID_LEAVE
  OTHER
}
```

### Enums Shopflow

```prisma
enum TransferStatus {
  PENDING
  IN_TRANSIT
  COMPLETED
  CANCELLED
}

enum LoyaltyPointType {
  EARNED
  REDEEMED
  EXPIRED
  ADJUSTED
}

enum ActionType {
  CREATE
  UPDATE
  DELETE
  VIEW
  LOGIN
  LOGOUT
  EXPORT
  IMPORT
  PRINT
}
```

## Configuración de Conexión

### Variables de Entorno

Ver [.env.example](./.env.example) para detalles completos.

**Obligatorias**:
- `DATABASE_URL` - Conexión pooled para runtime (con `-pooler` para Neon)

**Opcionales**:
- `DIRECT_URL` - Conexión directa para migraciones (sin `-pooler`)

### Migraciones

**Ubicación**: `services/database/prisma/migrations/`

**Comandos**:
```bash
# Desarrollo
cd services/database
pnpm migrate:dev --name nombre_migracion

# Producción
pnpm migrate:deploy
```

**Nota**: Todas las migraciones se ejecutan desde `services/database/`, no desde otros servicios.

## Resolución de Conflictos

### User.name vs firstName/lastName

**Decisión**: Usar `firstName` y `lastName` (estructura de Workify)

**Razón**: Más flexible y completo para gestión de usuarios

**Migración**: Si hay datos existentes, dividir `name` en `firstName` y `lastName`

### User.active vs isActive

**Decisión**: Usar `isActive` (estándar de Workify)

**Razón**: Consistente con otros campos booleanos (`isDeleted`, `isRead`)

### Notification: Estructura Simple vs Completa

**Decisión**: Usar estructura de Shopflow (más completa) + `companyId` opcional

**Razón**: Más funcional y flexible, compatible con ambos módulos

### TimeEntry: Estructura Diferente

**Decisión**: Usar estructura de Workify (`date`, `clockIn`, `clockOut`, `companyId`)

**Razón**: Más específica para gestión de asistencia

## Guía de Migración para Desarrolladores

### Antes de Agregar un Nuevo Modelo

1. ✅ Revisar [CONVENTIONS.md](./CONVENTIONS.md) para convenciones de nombres
2. ✅ Verificar si existe un modelo similar en el schema
3. ✅ Usar tipos de datos estándar (Decimal para monedas, Json para estructurados)
4. ✅ Agregar campos estándar (`createdAt`, `updatedAt`)
5. ✅ Usar `is` para campos booleanos
6. ✅ Documentar relaciones claramente

### Al Modificar un Modelo Existente

1. ✅ Crear migración con `pnpm migrate:dev --name descripcion`
2. ✅ Verificar compatibilidad con ambos módulos (workify y shopflow)
3. ✅ Actualizar seeds si es necesario
4. ✅ Documentar cambios en este archivo

### Al Agregar un Nuevo Enum

1. ✅ Usar UPPER_SNAKE_CASE
2. ✅ Verificar si existe un enum similar
3. ✅ Agregar valores descriptivos y consistentes
4. ✅ Documentar en este archivo

## Seeds

**Ubicación**: `services/database/prisma/seed.ts`

**Contenido**: Seeds unificados para ambos módulos

**Ejecución**:
```bash
cd services/database
pnpm db:seed
```

## Referencias

- [CONVENTIONS.md](./CONVENTIONS.md) - Convenciones de nombres detalladas
- [README.md](./README.md) - Documentación del servicio Database
- [.env.example](./.env.example) - Configuración de conexión

## Mantenimiento

Este documento debe actualizarse cuando:
- Se agreguen nuevos modelos al schema
- Se modifiquen convenciones establecidas
- Se resuelvan nuevos conflictos entre módulos
- Se agreguen nuevos criterios de unificación
