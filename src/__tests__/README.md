# Tests de Conexión Database

Este directorio contiene los tests unitarios y de integración para verificar la conexión de Prisma a PostgreSQL.

## Estructura

- `client.test.ts` - Tests unitarios del cliente Prisma (con mocks)
- `connection.test.ts` - Tests de integración que verifican conexión real a PostgreSQL
- `setup.ts` - Configuración de entorno para los tests

## Ejecutar Tests

### Todos los tests
```bash
cd services/database
pnpm test
```

### Solo tests unitarios
```bash
pnpm test:unit
```

### Solo tests de integración
```bash
pnpm test:integration
```

### Tests en modo watch
```bash
pnpm test:watch
```

### Con cobertura
```bash
pnpm test:coverage
```

## Requisitos para Tests de Integración

Los tests de integración requieren que PostgreSQL esté disponible. Puedes usar:

1. **Docker Compose** (recomendado):
   ```bash
   docker-compose up -d postgres
   ```

2. **PostgreSQL local**: Asegúrate de que PostgreSQL esté corriendo en `localhost:5432`

3. **Base de datos de test**: Los tests usan `multisystem_test_db` por defecto. Configura `DATABASE_URL_TEST` en `.env.test` si necesitas una URL diferente.

## Variables de Entorno

Crea un archivo `.env.test` con:
```
NODE_ENV=test
DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/multisystem_test_db
PORT=3001
```

## Notas

- Los tests unitarios no requieren una base de datos real (usan mocks)
- Los tests de integración requieren PostgreSQL corriendo
- Los tests de integración tienen timeouts de 10 segundos para dar tiempo a la conexión
