const UserSchema = require('../models/UserSchema')
const BookSchema = require('../models/BookSchema')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()

router.post('/register', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ msg: 'Password and email are required' })

  if (password.length < 8) {
    return res
      .status(400)
      .json({ msg: 'Password should be at least 8 characters long' })
  }

  const user = await UserSchema.findOne({ email })
  if (user) return res.status(400).json({ msg: 'User already exists' })

  const newUser = new UserSchema({ email, password })
  bcrypt.hash(password, 7, async (err, hash) => {
    if (err)
      return res.status(400).json({ msg: 'error while saving the password' })

    newUser.password = hash
    const savedUserRes = newUser.save()

    if (savedUserRes)
      return res.status(200).json({ msg: 'user is successfully saved' })
  })
})

router.post(`/login`, async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ msg: 'Something missing' })
  }

  const user = await UserSchema.findOne({ email: email }) // finding user in db
  if (!user) {
    return res.status(400).json({ msg: 'User not found' })
  }

  const matchPassword = await bcrypt.compare(password, user.password)
  if (matchPassword) {
    const userSession = { email: user.email } // creating user session to keep user loggedin also on refresh
    req.session.user = userSession // attach user session to session object from express-session

    return res
      .status(200)
      .json({ msg: 'You have logged in successfully', userSession }) // attach user session id to the response. It will be transfer in the cookies
  } else {
    return res.status(400).json({ msg: 'Invalid credential' })
  }
})

router.delete(`/api/logout`, async (req, res) => {
  req.session.destroy((error) => {
    if (error) throw error

    res.clearCookie('session-id') // cleaning the cookies from the user session
    res.status(200).send('Logout Success')
  })
})

router.post('/books', async (req, res) => {
  try{
  const { bookName, writer } = req.body
  await client.connect()

  if (!bookName || !writer)
  return res.status(400).json({ msg: 'book name and writer are required' })
     
  const db = client.db('<test>');
  const collection = db.collection('books');

  // Insert the book data into the collection
  const result = await collection.insertOne({ bookName, writer });
    console.log('Book data saved to MongoDB:', result.insertedId);

  res.status(200).json({ message: 'Book data saved successfully' });
} catch (error) {
  console.error('Error saving book data to MongoDB:', error);
  res.status(400).json({ error: 'An error occurred while saving book data' });
} finally {
  // Close the MongoDB connection
  await client.close();
}
})


router.get('/isAuth', async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user)
  } else {
    return res.status(401).json('unauthorize')
  }
})

module.exports = router
