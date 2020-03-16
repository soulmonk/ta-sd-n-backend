const DB = require('../libs/db')

class TrainingRepository {
  constructor (db) {
    this.db = db
  }

  async createSession (data) {
    // insert
    // assign to bank
    const { rows } = await this.db.query('INSERT INTO "training_session" (title, description) VALUES ($1, $2) RETURNING id',
      [data.title, data.description])

    return {
      id: rows[0].id
    }
  }

  async removeSession (id) {
    const { rows } = await this.db.query('DELETE FROM "training_session" WHERE id = $1', [id])

    return rows[0]
  }

  async complete (tsId) {
    // insert
    // assign to bank
    const { rows } = await this.db.query('UPDATE "training_session" SET done = true WHERE id = $1', [tsId])

    return rows[0]
  }

  async updatePlanOrders (orders) {
    // clear TP
    // insert orders
    await this.resetPlan()

    const sqlValues = orders.slice(1)
      .reduce((acc, tsId, idx) => acc + `,(${tsId},${idx + 1})`, `(${orders[0]},0)`)
    const { rows } = await this.db.query('INSERT INTO "training_plan" (training_session_id, priority) VALUES ' + sqlValues)

    return rows[0]
  }

  async getInBank () {
    // on separated plans need find better way
    const sql = `SELECT *
                 FROM "training_session" as ts
                 WHERE NOT exists(select 1 from "training_plan" as tsp where tsp.training_session_id = ts.id)`
    const { rows } = await this.db.query(sql)

    return rows
  }

  async getInPlan () {
    const sql = `SELECT ts.*, tsp.priority
                 FROM "training_plan" as tsp
                        INNER JOIN "training_session" as ts ON tsp.training_session_id = ts.id
                 ORDER BY tsp.priority`
    const { rows } = await this.db.query(sql)
    return rows
  }

  async resetPlan () {
    const { rows } = await this.db.query('TRUNCATE TABLE "training_plan"')

    return {
      ...rows[0]
    }
  }
}

module.exports = new TrainingRepository(DB.instance())
