# Convenciones de Nombres - Base de Datos Unificada

Este documento establece las convenciones de nombres unificadas para la base de datos compartida entre Workify y Shopflow.

## Convenciones de Tablas (Mapas)

### Reglas Generales

- **Snake_case**: Todas las tablas usan snake_case
- **Plural**: Las tablas siempre están en plural
- **Descriptivo**: Los nombres deben ser claros y descriptivos

### Ejemplos

```
users
sale_items
time_entries
loyalty_points
store_configs
ticket_configs
user_preferences
notification_preferences
inventory_transfers
work_shifts
special_day_assignments
role_permissions
user_roles
```

### Prefijos

- Usar prefijos cuando sea necesario para agrupar tablas relacionadas:
  - `store_configs` (no `stores_config`)
  - `ticket_configs` (no `tickets_config`)
  - `loyalty_configs` (no `loyalties_config`)

## Convenciones de Campos

### Reglas Generales

- **CamelCase**: Todos los campos en modelos Prisma usan camelCase
- **Descriptivo**: Los nombres deben ser claros y autodocumentados

### Campos Booleanos

- **Prefijo `is`**: Todos los campos booleanos deben usar el prefijo `is`
- **Ejemplos**:
  - `isActive` (no `active`)
  - `isDeleted` (no `deleted`)
  - `isRead` (no `read`)
  - `isNightShift` (no `nightShift`)
  - `isRecurring` (no `recurring`)

### Campos de Fecha

- **Estándar de creación**: `createdAt` (siempre presente)
- **Estándar de actualización**: `updatedAt` (siempre presente con `@updatedAt`)
- **Eliminación lógica**: `deletedAt` (opcional, para soft delete)
- **Otros campos de fecha**: Usar nombres descriptivos
  - `expiresAt`
  - `readAt`
  - `completedAt`
  - `startDate`
  - `endDate`
  - `birthDate`
  - `dateJoined`

### Campos de Identificación

- **ID principal**: `id` (siempre `String @id @default(uuid())`)
- **IDs de relación**: `{entity}Id` (ej: `userId`, `companyId`, `productId`)
- **Números de identificación**: `idNumber` (para documentos de identidad)

### Campos de Nombre

- **Personas**: `firstName`, `lastName` (no `name` para usuarios)
- **Entidades**: `name` (para empresas, productos, categorías, etc.)

### Campos de Email y Teléfono

- **Email**: `email` (siempre `String` o `String?`)
- **Teléfono**: `phone` (siempre `String?`)

## Convenciones de Enums

### Reglas Generales

- **UPPER_SNAKE_CASE**: Todos los valores de enum usan UPPER_SNAKE_CASE
- **Descriptivo**: Los nombres deben ser claros y autodocumentados
- **Consistente**: Usar los mismos valores para conceptos similares

### Ejemplos

```prisma
enum UserRole {
  USER
  ADMIN
  SUPERADMIN
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum SaleStatus {
  PENDING
  COMPLETED
  CANCELLED
  REFUNDED
}

enum NotificationPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Valores Estándar para Estados

- **ACTIVE/INACTIVE**: Para estados de activación
- **PENDING/APPROVED/REJECTED**: Para estados de aprobación
- **PENDING/COMPLETED/CANCELLED**: Para estados de proceso
- **UNREAD/READ/ARCHIVED**: Para estados de lectura

## Convenciones de Relaciones

### Nombres de Relaciones

- **Singular para uno**: `user`, `company`, `product`
- **Plural para muchos**: `users`, `companies`, `products`
- **Descriptivo**: Usar nombres que indiquen la relación

### Ejemplos

```prisma
// Relación uno-a-muchos
user      User     @relation(fields: [userId], references: [id])
users     User[]

// Relación muchos-a-muchos
userRoles UserRole[]
role      Role     @relation(fields: [roleId], references: [id])
```

### Relaciones Jerárquicas

- **Parent**: `parent` (singular)
- **Children**: `children` (plural)
- **Parent ID**: `parentId` (opcional)

```prisma
parentId  String?
parent    Category? @relation("CategoryParent", fields: [parentId], references: [id])
children  Category[] @relation("CategoryParent")
```

## Convenciones de Tipos de Datos

### Decimales

- **Monedas**: `Decimal @db.Decimal(10, 2)` (10 dígitos totales, 2 decimales)
- **Porcentajes**: `Decimal @db.Decimal(5, 4)` (5 dígitos totales, 4 decimales)
- **Multiplicadores**: `Decimal @db.Decimal(5, 2)` (5 dígitos totales, 2 decimales)

### Strings

- **Opcionales**: Usar `String?` para campos opcionales
- **Requeridos**: Usar `String` para campos requeridos
- **Únicos**: Usar `@unique` cuando corresponda

### JSON

- **Estructurado**: Usar `Json` para datos estructurados (no `String` con JSON)
- **Ejemplos**: `data`, `preferences`, `config`, `before`, `after`, `details`

### Fechas

- **DateTime**: Siempre usar `DateTime` para fechas
- **Defaults**: Usar `@default(now())` para creación, `@updatedAt` para actualización

## Convenciones de Índices

### Únicos

- **Campos únicos**: Usar `@unique` en el campo
- **Combinaciones únicas**: Usar `@@unique([field1, field2])`

### Ejemplos

```prisma
email     String   @unique
@@unique([userId, roleId, companyId])
```

## Convenciones de Soft Delete

- **Campo booleano**: `isDeleted Boolean @default(false)`
- **Campo de fecha**: `deletedAt DateTime?`
- **Ambos**: Usar ambos campos para soft delete completo

## Convenciones de Nombres de Archivos

- **Schema**: `schema.prisma`
- **Migraciones**: `{timestamp}_{description}/migration.sql`
- **Seeds**: `seed.ts`

## Resumen de Reglas Clave

1. ✅ **Tablas**: snake_case, plural
2. ✅ **Campos**: camelCase
3. ✅ **Booleanos**: Prefijo `is`
4. ✅ **Fechas**: `createdAt`, `updatedAt`, `deletedAt`
5. ✅ **Enums**: UPPER_SNAKE_CASE
6. ✅ **Relaciones**: Singular para uno, plural para muchos
7. ✅ **Decimales**: `@db.Decimal(precision, scale)`
8. ✅ **JSON**: Usar tipo `Json`, no `String`

## Ejemplos Completos

### Modelo con Todas las Convenciones

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  sku         String?  @unique
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  category    Category? @relation(fields: [categoryId], references: [id])
  saleItems   SaleItem[]
  
  @@map("products")
}
```

### Enum con Convenciones

```prisma
enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
}
```
