const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// node mongo.js yourpassword Anna 040-1234556
if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstackopen:${password}@phonebook.zn5txfk.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: [true, 'Name on the phonebook must be unique']
  },
  number: {
    type: String,
    minLength: 8,
    required: true
  }
})

const Person = mongoose.model('Phonebook', phonebookSchema)

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log('phonebook')
      Person.find({}).then(result => {
        result.forEach(p => {
          console.log(`${p.name} ${p.number}`)
        })
        mongoose.connection.close()
      })
    })
    .catch((err) => console.log(err))
} else {
  mongoose
    .connect(url)
    .then(() => {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
      })
      return person.save()
    })
    .then(() => {
      // console.log(res)
      console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}

