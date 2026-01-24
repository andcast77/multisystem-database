import { prisma } from '../client'

describe('Database Connection - Integration Tests', () => {
  const originalEnv = process.env.DATABASE_URL

  beforeAll(async () => {
    // Usar la URL de test si está disponible
    if (process.env.DATABASE_URL_TEST) {
      process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
    }
  })

  afterAll(async () => {
    // Restaurar la URL original
    if (originalEnv) {
      process.env.DATABASE_URL = originalEnv
    } else {
      delete process.env.DATABASE_URL
    }

    // Desconectar Prisma
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Ignorar errores de desconexión en tests
    }
  })

  describe('Conexión a PostgreSQL', () => {
    it('debería conectarse exitosamente a la base de datos', async () => {
      // Intentar ejecutar una query simple
      const result = await prisma.$queryRaw`SELECT 1 as value`
      expect(result).toBeDefined()
    }, 10000)

    it('debería poder ejecutar queries básicas', async () => {
      // Verificar que podemos hacer una query simple
      const result = await prisma.$queryRaw`SELECT NOW() as current_time`
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    }, 10000)

    it('debería manejar errores de conexión cuando la BD no está disponible', async () => {
      // Guardar la URL original
      const originalUrl = process.env.DATABASE_URL

      // Usar una URL inválida
      process.env.DATABASE_URL = 'postgresql://invalid:invalid@localhost:5432/invalid_db'

      // Crear un nuevo cliente con la URL inválida
      const { PrismaClient } = require('@prisma/client')
      const invalidClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      })

      // Intentar conectar debería fallar
      await expect(invalidClient.$connect()).rejects.toThrow()

      // Limpiar
      await invalidClient.$disconnect().catch(() => {})
      process.env.DATABASE_URL = originalUrl
    }, 15000)

    it('debería poder conectarse y desconectarse múltiples veces', async () => {
      // Conectar
      await prisma.$connect()
      expect(prisma).toBeDefined()

      // Desconectar
      await prisma.$disconnect()

      // Reconectar
      await prisma.$connect()
      expect(prisma).toBeDefined()
    }, 10000)
  })

  describe('Health Check de Conexión', () => {
    it('debería verificar que la conexión está activa', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as health`
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect((result as any[])[0]).toHaveProperty('health')
    }, 10000)

    it('debería poder verificar el estado de la conexión', async () => {
      // Verificar que podemos hacer una query
      const isConnected = await prisma.$queryRaw`SELECT 1`
        .then(() => true)
        .catch(() => false)

      expect(isConnected).toBe(true)
    }, 10000)
  })
})
