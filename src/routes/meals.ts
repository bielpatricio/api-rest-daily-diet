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
          ...meal,
          date: formattedDate,
        }
      })

      return { total: meals.length, meals: formattedMeals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
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

      return { ...meal, date: moment(meal.date).format() }
    },
  )

  app.delete('/:id', async (request, reply) => {
    const deleteMealSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealSchema.parse(request.params)

    const deleteMeal = await knex('meals')
      .where({
        id,
      })
      .del()

    if (deleteMeal === 0) {
      return reply.status(404).send({
        error: 'Meal not found',
      })
    }

    return reply.status(202).send()
  })

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
}
