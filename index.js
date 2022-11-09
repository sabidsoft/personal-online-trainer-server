// import module
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

// variables
const app = express()
const port = process.env.PORT || 5000
const uri = process.env.DATABASE
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

// using middlewares
app.use(cors())
app.use(express.json())

// function for API
const run = async () => {
    try{
        const servicesCollection = client.db('personal_online_trainer').collection('services')

        app.get('/services-home', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query).sort({ '_id': -1 }).limit(3)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query).sort({ '_id': -1 })
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await servicesCollection.findOne(query)
            res.send(service)
        })
    }
    finally{}
}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send({success: true, message: 'Server is running!'})
})

// listening app
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})