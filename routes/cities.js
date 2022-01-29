// load the modules
const express = require(`express`)
const sql = require(`mssql`)
const config = require(`../utils/config`)

let citiesRoute = express.Router()

//---> Add cities

citiesRoute.post(`/add`, async (req, res) => {
    //get the request body
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`City_Name`, sql.NVarChar(50), body.City_Name)
        .input(`Country`, sql.NVarChar(50), body.Country)
        .input(`Title`, sql.NVarChar(50), body.Title)
        .input(`Information`, sql.NVarChar(200), body.Information)
        .input(`language`, sql.NVarChar(50), body.language)
        .input(`Currency`, sql.NVarChar(50), body.Currency)
        .input(`Weather`, sql.NVarChar(50), body.Weather)
        .input(`Rating_Star`, sql.TinyInt, body.Rating_Star)
        .input(`Image`, sql.NVarChar, body.Image)
        .output(`City_Id`, sql.Int)
        .execute(`AddCity`)

    let data = await query

    await db.close()

    res.send(data)
})

//---> All cities

citiesRoute.get(`/`, async (req, res) => {
    //טיפול בשגיאות
    sql.on(`error`, (error) => res.send(error))

    // התחברות למסד הנתונים
    let db = await sql.connect(config.db)

    // run a query
    let query = await db.request().execute(`SelectAllCities`)

    //get the data
    let data = await query.recordset

    //close the server
    await db.close()

    //send the data to the clinet via the api
    res.send(data)
})

//---> cities Details by cities id

citiesRoute.get('/:id', async (req, res) => {

    //get the params from the requset
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`City_Id`, sql.Int, params.id)
        .execute(`SelectCityById`)

    // get the data
    let data = await query.recordset

    //close the connection
    await db.close()

    //return to the clinet via api
    //מפני שהנתונים הם רשומות אפשר לגשת לרשומה הראשונה ולקבל את האובייקט עצמו
    res.send(data[0])
})

//---> Edit cities Details by cities id

citiesRoute.put('/edit/:id', async (req, res) => {

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
        .input(`City_Id`, sql.Int, params.id)
        .input(`City_Name`, sql.NVarChar(50), body.City_Name)
        .input(`Country`, sql.NVarChar(50), body.Country)
        .input(`Title`, sql.NVarChar(50), body.Title)
        .input(`Information`, sql.NVarChar(200), body.Information)
        .input(`language`, sql.NVarChar(50), body.language)
        .input(`Currency`, sql.NVarChar(50), body.Currency)
        .input(`Weather`, sql.NVarChar(50), body.Weather)
        .input(`Rating_Star`, sql.TinyInt, body.Rating_Star)
        .input(`Image`, sql.NVarChar, body.Image)
        .execute(`Edit_City`)

    let data = await query

    await db.close()

    res.send(data)
})

//---> Delete City by City id

citiesRoute.delete('/delete/:id', async (req, res) => {

    let params = req.params

    sql.on(`error`, (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`City_Id`, sql.Int, params.id)
        .execute(`Delete_City`)

    let data = await query

    await db.close()

    res.send(data)
})

//---> city attractions by city id

citiesRoute.get('/attractions/:id', async (req, res) => {

    //get the params from the requset
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`City_Id`, sql.Int, params.id)
        .execute(`SelectAttractionsByCityId`)

    // get the data
    let data = await query.recordset

    //close the connection
    await db.close()

    //return to the clinet via api
    //מפני שהנתונים הם רשומות אפשר לגשת לרשומה הראשונה ולקבל את האובייקט עצמו
    res.send(data)
})

// להוסיף את הפרודצרה SelectAttractionsByCity

//---> cities Details by cities name
citiesRoute.post('/cityname', async (req, res) => {

    //get the params from the requset
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`City_Name`, sql.NVarChar(50), body.City_Name)
        .execute(`SelectCityByCityName`)

    // get the data
    let data = await query.recordset

    //close the connection
    await db.close()

    //return to the clinet via api
    //מפני שהנתונים הם רשומות אפשר לגשת לרשומה הראשונה ולקבל את האובייקט עצמו
    res.send(data)
})


//export the router
module.exports = citiesRoute