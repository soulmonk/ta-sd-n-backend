const DB = require('../libs/db')

class TrainingRepository {
  constructor (db) {
    this.db = db
  }

  async createSession (data) {
    // insert
    // assign to bank
    const { rows } = await this.db.query('INSERT INTO "training_session" (title, description, user_id) VALUES ($1, $2, $3) RETURNING id',
      [data.title, data.description, data.userId])

    return {
      id: rows[0].id
    }
  }

  async removeSession (id, userId) {
    const { rows } = await this.db.query('DELETE FROM "training_session" WHERE id = $1 AND user_id = $2', [id, userId])

    return rows[0]
  }

  async complete (tsId, userId) {
    // insert
    // assign to bank
    const { rows } = await this.db.query('UPDATE "training_session" SET done = true WHERE id = $1 AND user_id = $2', [tsId, userId])

    return rows[0]
  }

  async updatePlanOrders (orders, userId) {
    // clear TP
    // insert orders
    // ts must belong to the specific user
    await this.resetPlan(userId)

    const sqlValues = orders.slice(1)
      .reduce((acc, tsId, idx) => acc + `,(${tsId},${idx + 1})`, `(${orders[0]},0)`)
    const { rows } = await this.db.query('INSERT INTO "training_plan" (training_session_id, priority) VALUES ' + sqlValues)

    return rows[0]
  }

  async getInBank (userId) {
    // on separated plans need find better way
    const sql = `SELECT ts.id, ts.title, ts.description
                 FROM "training_session" as ts
                 WHERE ts.user_id = $1
                   and NOT exists(select 1 from "training_plan" as tsp where tsp.training_session_id = ts.id)`
    const { rows } = await this.db.query(sql, [userId])

    return rows
  }

  async getInPlan (userId) {
    const sql = `SELECT ts.id, ts.title, ts.description, tsp.priority
                 FROM "training_plan" as tsp
                        INNER JOIN "training_session" as ts ON tsp.training_session_id = ts.id and ts.user_id = $1
                 ORDER BY tsp.priority`
    const { rows } = await this.db.query(sql, [userId])
    return rows
  }

  async resetPlan (userId) {
    const query = 'DELETE FROM "training_plan" as tsp WHERE exists(SELECt 1 FROM "training_session" as ts WHERE tsp.training_session_id = ts.id and ts.user_id = $1)'
    const { rows } = await this.db.query(query, [userId])

    return {
      ...rows[0]
    }
  }
}

module.exports = new TrainingRepository(DB.instance())
