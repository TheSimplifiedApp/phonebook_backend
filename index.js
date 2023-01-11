require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())

const cors = require('cors')
app.use(cors())

var morgan = require('morgan')
morgan.token('request_body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request_body'))

app.use(express.static('build'))

const Person = require('./models/person')

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.post('/api/persons', (request, response, next) => {

  const { name, number } = request.body
  if (!name || !number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({ name, number })
  person
    .save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const newRecord = request.body
  Person
    .findByIdAndUpdate(request.params.id, newRecord, { new: true, runValidators: true, context: 'query' })
    .then(updatedRecord => {
      console.log(updatedRecord)
      response.json(updatedRecord)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const timestamp = new Date(Date.now()).toString()
  Person
    .count()
    .then(number => {
      response.send(`
                <p>Phonebook has info for ${number} people</p>
                <p>${timestamp}</p>
            `)
    })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})