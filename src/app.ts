import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { UsersRoutes } from './routes/users'
import { MealsRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)

app.register(UsersRoutes, {
  prefix: 'users',
})

app.register(MealsRoutes, {
  prefix: 'meals',
})
