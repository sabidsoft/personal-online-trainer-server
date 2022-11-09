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
        const reviewsCollection = client.db('personal_online_trainer').collection('reviews')

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

        app.post('/reviews', async(req, res) => {
            const reviewInfo = req.body
            const result = await reviewsCollection.insertOne(reviewInfo)
            res.send(result)
        })

        app.get('/reviews/:id', async(req, res) => {
            const id = req.params.id
            const query = { service_id: id }
            const cursor = reviewsCollection.find(query).sort({ '_id': -1 })
            const reviews = await cursor.toArray()
            res.send(reviews)
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