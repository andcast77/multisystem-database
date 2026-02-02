# Diseño: Usuarios, Empresas y Módulos (Workify / Shopflow)

## Resumen del modelo

- **Superusuario**: usuario de plataforma que puede entrar en cualquier empresa (no pertenece a ninguna).
- **Registrante (owner)**: quien crea la empresa; no es un "usuario de la empresa" normal; tiene control total (incl. eliminar empresa).
- **Administradores de empresa**: creados por el owner; pueden gestionar usuarios y contenido pero **no** eliminar empresa ni transferir ownership.
- **Usuarios de empresa**: creados por la empresa (owner/admin); usan Workify y/o Shopflow según los módulos activos.
- **Empresas** activan **módulos** independientes: Workify (RRHH), Shopflow (ventas). Un mismo usuario de la empresa puede verse en ambos si la empresa tiene ambos módulos.

**Registro de empresas**: solo desde el **Hub**. Workify y Shopflow no exponen pantalla de registro de empresa.

**Creación de usuarios**: solo desde **dentro** de Workify y Shopflow, en la pestaña **Usuarios**. Owner o admin crean usuarios (CompanyMember USER o ADMIN). Más adelante se puede valorar invitación por email.

**Un solo esquema de usuarios**: todos comparten el mismo modelo `User` + `CompanyMember`. La lista de usuarios de la empresa es la misma en Workify y en Shopflow; la API de usuarios de la empresa es única (por `companyId`).

---

## Tipos de usuario (a nivel lógico)

| Tipo | Descripción | Pertenece a empresa | Dónde se modela |
|------|-------------|---------------------|------------------|
| **Superuser** | Acceso plataforma; puede "entrar" en cualquier empresa | No | `User.isSuperuser` |
| **Owner (registrante)** | Creó la empresa; control total (eliminar, transferir, etc.) | Sí (como owner) | `Company.ownerUserId` + `CompanyMember.membershipRole = OWNER` |
| **Admin de empresa** | Gestiona usuarios y contenido; no puede eliminar empresa | Sí | `CompanyMember.membershipRole = ADMIN` |
| **Usuario de empresa** | Uso normal de Workify/Shopflow | Sí | `CompanyMember.membershipRole = USER` |

- El **superuser** no es usuario de ninguna empresa.
- El **usuario que registra la empresa** es el **owner** de esa empresa; no se considera "usuario normal": tiene rol OWNER en `CompanyMember`.
- Los **usuarios normales** son los que la empresa crea/invita (CompanyMember USER o ADMIN).

---

## Casos de uso principales

### Registro y empresa

1. **Registro de empresa** (solo desde el Hub): se crea `Company` (nombre, `ownerUserId` = ese usuario, módulos según flujo), `User`, `CompanyMember(userId, companyId, OWNER)`. Opcional: rol "admin" en Workify (`UserRoleAssignment`) para que el owner tenga permisos en la UI.

2. **Activación de módulos**: la empresa tiene `workifyEnabled` y/o `shopflowEnabled`. Solo se muestran/usan Workify o Shopflow según eso.

### Login y contexto de empresa

3. **Login superuser**: si `User.isSuperuser`, no se exige empresa en el token; se devuelve lista de empresas; el token puede llevar `companyId` opcional (empresa "actual").

4. **Login usuario de empresa**: empresas por `CompanyMember` (y `user_roles` en transición). Si una empresa: token con ese `companyId`. Si varias: lista y el cliente elige; token con el `companyId` elegido.

5. **Cambio de empresa (multi-empresa)**: usuario puede ser miembro de varias empresas; en la UI puede "cambiar de empresa"; se reemite token con el nuevo `companyId`.

### Permisos dentro de la empresa

6. **Eliminar empresa**: solo el **owner** (o superuser). No los admins.

7. **Transferir ownership**: solo el **owner**: otro miembro pasa a OWNER, el actual puede pasar a ADMIN.

8. **Invitar / crear usuarios (admins o usuarios)**: **Owner** o **Admin** pueden crear/invitar usuarios y asignarles `CompanyMember` con role ADMIN o USER.

9. **Quitar usuario de la empresa**: **Owner** o **Admin**. No se puede quitar al owner sin antes transferir la propiedad.

10. **Ver usuarios de la empresa**: la misma lista en Workify y en Shopflow (mismo endpoint por `companyId`).

### Otros casos de uso recomendados

11. **Desactivar empresa**: solo owner (o superuser). Campo `Company.isActive`.

12. **Auditoría**: usar `AuditLog` para eliminación de empresa, transferencia de ownership y cambios de rol en `CompanyMember`.

13. **Invitación por email**: owner/admin envían invitación; al aceptar se crea User y `CompanyMember`. Valorar más adelante.

---

## Modelo de datos (resumen)

- **User**: `isSuperuser`, relaciones `companiesOwned`, `companyMemberships`.
- **Company**: `ownerUserId`, `workifyEnabled`, `shopflowEnabled`, `isActive`, relación `members` (CompanyMember[]).
- **CompanyMember**: `userId`, `companyId`, `membershipRole` (OWNER | ADMIN | USER), unique (userId, companyId).
- **MembershipRole** (enum): OWNER, ADMIN, USER.

Ver `prisma/schema.prisma` para la definición exacta.
