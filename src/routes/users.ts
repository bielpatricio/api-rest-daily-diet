import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto, { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { User } from '../@types/user'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import moment from 'moment'

export async function UsersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchema = z
      .object({
        username: z
          .string()
          // /^/ -> quer dizer que sobre o texto ->
          // a-z -> textos apenas do alfabeto
          // \\- -> ou hifens
          // + -> pode aparecer mais vezes
          // $ -> precisa começar e terminar com essa regra, não apenas conter
          // i -> tanto fazer se maiúscula ou minuscula
          .regex(/^([a-z\\-]+)$/i, {
            message: 'O usuário pode ter apenas letras e hifens',
          })
          .min(3, { message: 'Mínimo de 3 letras para o username' })
          .transform((value) => value.toLowerCase()),
        password: z
          .string()
          .min(3, { message: 'Mínimo de 3 letras para a senha' }),
        email: z.string().email(),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Senhas não são iguais',
        path: ['confirmPassword'],
      })

    const { username, password, email, confirmPassword } =
      createUserSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24, // 1 days
      })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      username,
      email,
      password,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals').where('session_id', sessionId).select()
      const mealsInDiet = meals.filter((meal) => meal.inDiet)
      const mealsOutDiet = meals.filter((meal) => !meal.inDiet)

      const user = await knex('users')
        .where('session_id', sessionId)
        .select()
        .first()

      const mealsSequence = meals.reduce(
        (count, meal) => {
          if (meal.inDiet) {
            count.sequence++
          }
          if (!meal.inDiet) {
            if (count.sequence > count.total) {
              count.total = count.sequence
            }
            count.sequence = 0
          }

          return count
        },
        {
          total: 0,
          sequence: 0,
        },
      )

      return {
        total: meals.length,
        totalInDiet: mealsInDiet.length,
        totalOutDiet: mealsOutDiet.length,
        BestSequence:
          mealsSequence.sequence > mealsSequence.total
            ? mealsSequence.sequence
            : mealsSequence.total,
        user: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
        },
      }
    },
  )

  app.put('/login', async (request, reply) => {
    const loginUserSchema = z
      .object({
        username: z
          .string()
          .regex(/^([a-z\\-]+)$/i, {
            message: 'O usuário pode ter apenas letras e hifens',
          })
          .min(3, { message: 'Mínimo de 3 letras para o username' })
          .transform((value) => value.toLowerCase())
          .optional(),
        password: z
          .string()
          .min(3, { message: 'Mínimo de 3 letras para a senha' }),
        email: z.string().email().optional(),
      })
      .refine(
        (value) => {
          const checkEmailOrUsername = !value.email && !value.username
          return !checkEmailOrUsername
        },
        {
          message: 'Email ou Username obrigatório',
          path: ['email'],
        },
      )

    const { username, password, email } = loginUserSchema.parse(request.body)

    let user

    if (!username && !email) {
      return reply.status(401).send({
        error: 'Username or email is required',
      })
    }

    if (email) {
      user = await knex('users')
        .where({
          email,
        })
        .first()
    }

    if (username) {
      user = await knex('users')
        .where({
          username,
        })
        .first()
    }

    if (!user) {
      return reply.status(404).send({
        error: 'User not found',
      })
    }

    if (user?.password !== password) {
      return reply.status(401).send({
        error: 'Password is incorrect',
      })
    }

    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24, // 1 days
    })

    await knex('meals').where({ session_id: user.session_id }).update(
      {
        session_id: sessionId,
        updated_at: knex.fn.now(),
      },
      ['id', 'session_id', 'updated_at'],
    )

    await knex('users').where({ id: user.id }).update(
      {
        session_id: sessionId,
        updated_at: knex.fn.now(),
      },
      ['id', 'session_id', 'updated_at'],
    )

    return reply.status(202).send()
  })

  app.delete('/:id', async (request, reply) => {
    const deleteUserSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteUserSchema.parse(request.params)

    const deleteUser = await knex('users')
      .where({
        id,
      })
      .del()

    if (deleteUser === 0) {
      return reply.status(404).send({
        error: 'User not found',
      })
    }

    return reply.status(202).send()
  })
}
