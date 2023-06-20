import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import moment from 'moment'

describe('User routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        username: 'bieu',
        email: 'bieu@gmail.com',
        password: '123',
        confirmPassword: '123',
      })
      .expect(201)
  })

  it('should be able to delete a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const userInfoResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)

    await request(app.server)
      .delete(`/users/${userInfoResponse.body.user.id}`)
      .expect(202)
  })

  it('should be able to do a login with username', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .put('/users/login')
      .set('Cookie', cookies)
      .send({
        username: 'bieu',
        password: '123',
      })
      .expect(202)
  })

  it('should be able to do a login with email', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      username: 'bieu',
      email: 'bieu@gmail.com',
      password: '123',
      confirmPassword: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .put('/users/login')
      .set('Cookie', cookies)
      .send({
        email: 'bieu@gmail.com',
        password: '123',
      })
      .expect(202)
  })

  it('should be able to get info user', async () => {
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

    const userInfoResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    expect(userInfoResponse.body).toEqual({
      total: 4,
      totalInDiet: 3,
      totalOutDiet: 1,
      BestSequence: 2,
      user: {
        id: userInfoResponse.body.user.id,
        username: 'bieu',
        email: 'bieu@gmail.com',
      },
    })
  })
})
