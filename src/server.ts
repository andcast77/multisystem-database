import Fastify from 'fastify'
import cors from '@fastify/cors'
import env from '@fastify/env'
import { prisma } from './client'

const fastify = Fastify({ logger: true })

const envSchema = {
  type: 'object',
  required: [],
  properties: {
    PORT: {
      type: 'string',
      default: '3001'
    },
    CORS_ORIGIN: {
      type: 'string',
      default: 'http://localhost:3000'
    },
    DATABASE_URL: {
      type: 'string'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    }
  }
}

async function start() {
  try {
    await fastify.register(env, {
      schema: envSchema,
      dotenv: true
    })

    const config = (fastify as any).config as {
      PORT: string
      CORS_ORIGIN: string
      DATABASE_URL?: string
      NODE_ENV: string
    }

    await fastify.register(cors, {
      origin: config.CORS_ORIGIN.split(',')
    })

    // GET /users - Obtener todos los usuarios
    fastify.get('/users', async (request, reply) => {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return {
          success: true,
          data: users,
          count: users.length,
        }
      } catch (error) {
        fastify.log.error(error)
        reply.code(500)
        return {
          success: false,
          error: 'Error al obtener usuarios',
          message: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    })

    // GET /users/:id - Obtener un usuario por ID
    fastify.get<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
      try {
        const { id } = request.params

        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        if (!user) {
          reply.code(404)
          return {
            success: false,
            error: 'Usuario no encontrado',
          }
        }

        return {
          success: true,
          data: user,
        }
      } catch (error) {
        fastify.log.error(error)
        reply.code(500)
        return {
          success: false,
          error: 'Error al obtener usuario',
          message: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    })

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', service: 'database' }
    })

    const port = parseInt(config.PORT, 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    
    console.log(`🚀 Database API server listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
