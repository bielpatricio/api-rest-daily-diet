import { Knex } from 'knex'
import { User } from './user'

declare module 'knex/types/tables' {
  export interface Tables {
    users: User
  }
}
