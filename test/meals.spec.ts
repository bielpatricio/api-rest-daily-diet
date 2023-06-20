import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import moment from 'moment'

describe('Meal routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'jantar',
        description: 'ovos e cuscuz',
        inDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to edit a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'ovos e cuscuz',
      inDiet: true,
      date: new Date(),
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Cafe',
        description: 'ovos',
        inDiet: true,
        date: new Date(),
      })
      .expect(202)

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(mealResponse.body).toEqual({
      id: mealId,
      name: 'Cafe',
      description: 'ovos',
      inDiet: true,
      date: moment(mealResponse.body.date).format(),
      createdAt: mealResponse.body.createdAt,
      updatedAt: mealResponse.body.updatedAt,
    })
  })

  it('should be able to get all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'ovos e cuscuz',
      inDiet: true,
      date: new Date(),
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'miojo',
      inDiet: false,
      date: new Date(),
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'carne e arroz',
      inDiet: true,
      date: new Date(),
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'carne e cuscuz',
      inDiet: true,
      date: new Date(),
    })

    const mealsListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(mealsListResponse.body).toEqual({
      total: 4,
      meals: [
        {
          id: mealsListResponse.body.meals[0].id,
          name: 'jantar',
          description: 'ovos e cuscuz',
          inDiet: true,
          date: moment(mealsListResponse.body.meals[0].date).format(),
          createdAt: mealsListResponse.body.meals[0].createdAt,
          updatedAt: mealsListResponse.body.meals[0].updatedAt,
        },
        {
          id: mealsListResponse.body.meals[1].id,
          name: 'jantar',
          description: 'miojo',
          inDiet: false,
          date: moment(mealsListResponse.body.meals[1].date).format(),
          createdAt: mealsListResponse.body.meals[1].createdAt,
          updatedAt: mealsListResponse.body.meals[1].updatedAt,
        },
        {
          id: mealsListResponse.body.meals[2].id,
          name: 'jantar',
          description: 'carne e arroz',
          inDiet: true,
          date: moment(mealsListResponse.body.meals[2].date).format(),
          createdAt: mealsListResponse.body.meals[2].createdAt,
          updatedAt: mealsListResponse.body.meals[2].updatedAt,
        },
        {
          id: mealsListResponse.body.meals[3].id,
          name: 'jantar',
          description: 'carne e cuscuz',
          inDiet: true,
          date: moment(mealsListResponse.body.meals[3].date).format(),
          createdAt: mealsListResponse.body.meals[3].createdAt,
          updatedAt: mealsListResponse.body.meals[3].updatedAt,
        },
      ],
    })
  })

  it('should be able to get a meal by id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'ovos e cuscuz',
      inDiet: true,
      date: new Date(),
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(mealResponse.body).toEqual({
      id: mealId,
      name: 'jantar',
      description: 'ovos e cuscuz',
      inDiet: true,
      date: moment(mealResponse.body.date).format(),
      createdAt: mealResponse.body.createdAt,
      updatedAt: mealResponse.body.updatedAt,
    })
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'jantar',
      description: 'ovos e cuscuz',
      inDiet: true,
      date: new Date(),
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(202)
  })
})
