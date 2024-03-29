// load the modules
const express = require(`express`)
const sql = require(`mssql`)
const config = require(`../utils/config`)
const path = require('path')
const fs = require('fs')
// שליחת מייל אוטמטי
const nodemailer = require('nodemailer');

let BusinessUserRoute = express.Router()

const multer = require('multer')

const storage = multer.diskStorage({
    destination: "public/uploads/",
    filename: function (req, file, cb) {
        cb(null, "image-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage })


let newPassword = ""
// פונקציה ליצירת סיסמא רנדומלית
const generatePassword = () => {
    return new Promise((resolve, reject) => {
        try {
            let length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (let i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            console.log(retVal)
            resolve(retVal);
        } catch (error) {
            reject('')
        }
    })
}

const sendMail = (Email, Password) => {
    try {
        // step 1
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'utravel010@gmail.com',
                pass: 'avitslil10'
            }
        });

        // setp 2
        let mailOptions = {
            from: 'utravel010@gmail.com',
            to: Email,
            subject: 'UTravel - Password reset',
            text: 'Your password was reset\n' +
                'Your new passowrd is \n' + Password + ' \nNow you can login with the new passowrd \n Thank you, UTravel Team'
        };

        // step 3
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                alert("The Email Sent !!")
                console.log(info.response)
            }
        });
        return { Status: 'ok' }
    } catch (error) {
        return { Status: 'error' }
    }
}

// ---> Display All Bussines Users

BusinessUserRoute.get(`/`, async (req, res) => {
    //טיפול בשגיאות
    sql.on(`error`, (error) => res.send(error))

    // התחברות למסד הנתונים
    let db = await sql.connect(config.db)

    // run a query
    let query = await db.request().execute(`SelectAllBusiness`)

    //get the data
    let data = await query.recordset

    //close the server
    await db.close()

    //send the data to the clinet via the api
    res.send(data)
})

// ---> Register

BusinessUserRoute.post(`/Register`, async (req, res) => {
    //get the request body
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Business_Name`, sql.NVarChar(100), body.Business_Name)
        .input(`Owner_Name`, sql.NVarChar(100), body.Owner_Name)
        .input(`Email`, sql.VarChar(50), body.Email)
        .input(`Password`, sql.NVarChar(50), body.Password)
        .input(`Terms`, sql.Bit, body.Terms)
        .output(`Business_Id`, sql.Int)
        .execute(`RegisterBusiness`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

//---> Business User Login

BusinessUserRoute.post('/Login', async (req, res) => {

    //get the params from the requset
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Email`, sql.VarChar(50), body.Email)
        .input(`Password`, sql.NVarChar(50), body.Password)
        .execute(`LoginBusiness`)

    // get the data
    let data = await query.recordset

    //close the connection
    await db.close()

    //return to the clinet via api
    //מפני שהנתונים הם רשומות אפשר לגשת לרשומה הראשונה ולקבל את האובייקט עצמו
    res.send(data)
})


// ---> forgot password

BusinessUserRoute.put('/forgotpassword', async (req, res) => {

    newPassword = await generatePassword()

    //get the params from the requset body
    let body = req.body

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Email`, sql.VarChar(50), body.Email)
        .input(`New_Password`, sql.NVarChar(50), newPassword)
        .output(`Status`, sql.VarChar(10))
        .execute(`ForgotPassword_Business`)
    let data = query.output
    console.log(data)
    await db.close()

    if (data.Status == 'ok') {
        let send = sendMail(body.Email, newPassword)
        if (send.Status == 'ok') {
            res.send(data)
        }
    }
    else {
        res.send({ Status: 'error' })
    }

})

//---> Display profile details by user id
BusinessUserRoute.get('/:id', async (req, res) => {

    //get the params from the requset
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Business_Id`, sql.Int, params.id)
        .execute(`BusinessProfile_Details`)

    // get the data
    let data = await query.recordset

    //close the connection
    await db.close()

    //return to the clinet via api
    //מפני שהנתונים הם רשומות אפשר לגשת לרשומה הראשונה ולקבל את האובייקט עצמו
    res.send(data[0])
})

//---> Edit profile details by user id
BusinessUserRoute.put('/Edit/:id', async (req, res) => {

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
        .input(`Business_Id`, sql.Int, params.id)
        .input(`Business_Name`, sql.NVarChar(100), body.Business_Name)
        .input(`Owner_Name`, sql.NVarChar(100), body.Owner_Name)
        .input(`Email`, sql.VarChar(50), body.Email)
        .input(`Image`, sql.NVarChar(sql.MAX), body.Image)
        .execute(`Edit_Business`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

//---> Display attraction Bussines by user id
BusinessUserRoute.get('/attraction/:id', async (req, res) => {

    //get the params from the requset
    let params = req.params

    //טיפול בשגיאות
    sql.on('error', (error) => res.send(error))

    //connect to db
    let db = await sql.connect(config.db)

    //run the query
    let query = await db.request()
        .input(`Business_Id`, sql.Int, params.id)
        .execute(`SelectAttractionsByBusinessId`)

    // get the data
    let data = await query.recordset

    //close the connection
    await db.close()

    //return to the clinet via api
    //מפני שהנתונים הם רשומות אפשר לגשת לרשומה הראשונה ולקבל את האובייקט עצמו
    res.send(data)
})

//---> delete user by user id
BusinessUserRoute.delete('/delete/:id', async (req, res) => {

    let params = req.params

    sql.on(`error`, (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Business_Id`, sql.Int, params.id)
        .execute(`Delete_Business`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

BusinessUserRoute.get('/stockqty/:id', async (req, res) => {

    let params = req.params

    sql.on(`error`, (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Business_Id`, sql.Int, params.id)
        .execute(`SelectStockQtyByBusinessId`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

BusinessUserRoute.get('/instock/:id', async (req, res) => {

    let params = req.params

    sql.on(`error`, (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Business_Id`, sql.Int, params.id)
        .execute(`SelectInStockByBusinessId`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

BusinessUserRoute.get('/ticketssold/:id', async (req, res) => {

    let params = req.params

    sql.on(`error`, (error) => res.send(error))

    let db = await sql.connect(config.db)

    let query = await db.request()
        .input(`Business_Id`, sql.Int, params.id)
        .execute(`Tickets_Sold`)

    let data = await query.recordset

    await db.close()

    res.send(data)
})

BusinessUserRoute.post("/upload", (req, res) => {
    try {
        let body = req.body

        let data = body.photo.replace(/^data:image\/\w+;base64,/, '');
        let filename = `image_${Date.now()}.${body.photo.split(';')[0].split('/')[1]}`

        fs.writeFile(`public/uploads/${filename}`, data, {
            encoding: 'base64'
        }, function (err) {
        });

        let fullUrl = req.protocol + '://' + req.get('host');
        res.send({ img: `${fullUrl}/public/uploads/${filename}` });

    } catch (error) {
        res.send(error)
        console.log("error", error)
    }
})


//export the router
module.exports = BusinessUserRoute