import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto, { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import moment from 'moment'

export async function MealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals').where('session_id', sessionId).select()

      const formattedMeals = meals.map((meal) => {
        // Converte o valor do timestamp para uma string de data formatada
        const formattedDate = moment(meal.date).format()

        // Retorna um novo objeto de refeição com a data formatada
        return {
          id: meal.id,
          name: meal.name,
          description: meal.description,
          inDiet: !!meal.inDiet,
          date: formattedDate,
          updatedAt: meal.updated_at,
          createdAt: meal.created_at,
        }
      })

      return {
        total: meals.length,
        meals: formattedMeals,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      if (!meal) {
        return reply.status(404).send({
          error: 'Meal not found',
        })
      }

      return {
        date: moment(meal?.date).format(),
        id: meal.id,
        name: meal.name,
        description: meal.description,
        inDiet: !!meal.inDiet,
        updatedAt: meal.updated_at,
        createdAt: meal.created_at,
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealSchema = z.object({
        name: z
          .string()
          .min(3, { message: 'Mínimo de 3 letras para o username' }),
        description: z
          .string()
          .min(3, { message: 'Mínimo de 3 letras para o descrição' }),
        inDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, inDiet, date } = createMealSchema.parse(
        request.body,
      )

      const { sessionId } = request.cookies

      await knex('meals').insert({
        id: crypto.randomUUID(),
        name,
        description,
        inDiet,
        date,
        session_id: sessionId,
      })

      return reply.status(201).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteMealSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealSchema.parse(request.params)
      const { sessionId } = request.cookies

      const deleteMeal = await knex('meals')
        .where({
          id,
          session_id: sessionId,
        })
        .del()

      if (deleteMeal === 0) {
        return reply.status(404).send({
          error: 'Meal not found',
        })
      }

      return reply.status(202).send()
    },
  )

  app.put('/:id', async (request, reply) => {
    const updateMealSchema = z.object({
      name: z
        .string()
        .min(3, { message: 'Mínimo de 3 letras para o username' }),
      description: z
        .string()
        .min(3, { message: 'Mínimo de 3 letras para o descrição' }),
      inDiet: z.boolean(),
      date: z.coerce.date(),
    })

    const updateMealSchemaParams = z.object({
      id: z.string().uuid(),
    })

    const { name, description, inDiet, date } = updateMealSchema.parse(
      request.body,
    )
    const { id } = updateMealSchemaParams.parse(request.params)

    const sessionId = request.cookies.sessionId

    const meal = await knex('meals')
      .where({
        id,
        session_id: sessionId,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found',
      })
    }

    await knex('meals')
      .where({ id: meal.id })
      .update({ name, description, inDiet, date, updated_at: knex.fn.now() }, [
        'id',
        'name',
        'description',
        'inDiet',
        'date',
        'updated_at',
      ])

    return reply.status(202).send()
  })
}
