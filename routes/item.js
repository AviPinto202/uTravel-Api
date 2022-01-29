// load the modules
const express = require(`express`)
const sql = require(`mssql`)
const config = require(`../utils/config`)

let itemRoute = express.Router()

//---> Add item
itemRoute.post(`/add`, async (req, res) => {
    //get the request body
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Order_Id`, sql.Int, body.Order_Id)
        .input(`Attraction_Id`, sql.Int, body.Attraction_Id)
        .input(`Business_Id`, sql.Int, body.Business_Id)
        .input(`Quantity`, sql.TinyInt, body.Quantity)
        .execute(`AddItemToOrder`)

    let data = await query

    await db.close()

    res.send(data)
})

//---> Delete item by id

itemRoute.delete('/delete/:id', async (req, res) => {

    let params = req.params

    sql.on(`error`, (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Attraction_Id`, sql.Int, params.id)
        .execute(`DeleteItemFromOrder`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

//---> Select item Details by id

itemRoute.get('/selectItem/:id', async (req, res) => {

    //get the params from the requset params
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Attraction_Id`, sql.Int, params.id)
        .execute(`SelectItem`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

itemRoute.put('/reviewed/:ido/:ida', async (req, res) => {
    //get the params from the requset params
    let params = req.params

    //get the params from the requset body
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Order_Id`, sql.Int, params.ido)
        .input(`Attraction_Id`, sql.Int, params.ida)
        .execute(`Update_Reviewed`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

itemRoute.get('/iteminorder/:id', async (req, res) => {

    //get the params from the requset params
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Order_Id`, sql.Int, params.id)
        .execute(`SelectItemInOrder`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

itemRoute.get('/itemforreview/:id', async (req, res) => {

    //get the params from the requset params
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Order_Id`, sql.Int, params.id)
        .execute(`SelectItemForReview`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})


//export the router
module.exports = itemRoute