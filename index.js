// import module
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

// variables
const app = express()
const port = process.env.PORT || 5000
const uri = process.env.DATABASE
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

// using middlewares
app.use(cors())
app.use(express.json())

// jwt middleware
const verifyJWT = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ success: false, message: 'unauthorized access!' })
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ success: false, message: 'unauthorized access!' })
        }
        req.decoded = decoded
        next()
    })
}

// API
const run = async () => {
    try{
        const servicesCollection = client.db('personal_online_trainer').collection('services')
        const reviewsCollection = client.db('personal_online_trainer').collection('reviews')

        app.post('/jwt', (req, res) => {
            const userEmail = req.body
            const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token: token })
        })

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

        app.get('/my-reviews', verifyJWT, async(req, res) => {
            const queryEmail = req.query.email
            const query = { reviewer_email: queryEmail }
            const cursor = reviewsCollection.find(query).sort({ '_id': -1 })
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        app.get('/edit-review', async(req, res) => {
            const id = req.query.id
            const query = { _id: ObjectId(id) }
            const review = await reviewsCollection.findOne(query)
            res.send(review)
        })

        app.patch('/edit-review', async(req, res) => {
            const id = req.query.id
            const query = { _id: ObjectId(id) }
            const review = req.body.textareaReview
            const updateDocument = {
                $set: {
                    reviewer_review: review
                }
            }
            const result = await reviewsCollection.updateOne(query, updateDocument)
            res.send(result)
        })

        app.delete('/delete-review/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/add-service', async (req, res) => {
            const service = req.body
            const result = await servicesCollection.insertOne(service)
            res.send(result)
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