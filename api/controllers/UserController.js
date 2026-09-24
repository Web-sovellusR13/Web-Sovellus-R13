import { ApiError } from '../helper/ApiError.js' 
import { compare, hash, } from 'bcrypt' 
import jwt from 'jsonwebtoken' 
import { getUserByEmail, addNewUser, deleteUser  } from '../models/User.js'

const { sign } = jwt 
 
const signin = async (req, res,next) => { 
  try { 
    const email = req.body.user?.email?.trim().toLowerCase() 
    const password = req.body.user?.password 
    if (!email || !password) { 
      const error = new Error('Email and password are required') 
      error.status = 400 
      return next(error) 
    } 

    // mock up data. should come from database in future
    const result = await getUserByEmail(email);

    const dbUser = result.rows[0] 
    if (!dbUser || !(await compare(password, dbUser.password.trimEnd()))) { 
      const error = new Error('Invalid email or password') 
      error.status = 401 
      return next(error) 
    } 
    const token = sign( 
      { userId: dbUser.userID, email: dbUser.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }, 
    ) 
    return res.status(200).json({ id: dbUser.id, email: dbUser.email, token })
  } catch (error) { 
    console.log(error);
    return next(error) 
  } 
} 

const deleteAccount = async (req, res) => {

  const userId = req.user.userId

  const deletedUser = await deleteUser(userId)

  if (!deletedUser) {
    throw new ApiError('User not found', 404)
  }

  return res.status(200).json({
    message: 'User deleted successfully'
  })
}
 
const signup = async (req, res, next) => {
  try{
    const email = req.body.user?.email?.trim().toLowerCase()
    const username = req.body.user?.username?.trim().toLowerCase()
    const password = req.body.user?.password
    if (!email || !username || !password) {
      const error = new Error('Please fill up all the fields.')
      error.status = 400
      return next(error)
    } 
    const result = await addNewUser(username, email, password)
    return res.status(201).json(result.rows[0])
  } catch (error)  {
    if (error.code === '23505') {
      error.status = 409
      error.message = 'Username  or email is already in use'
    }
    return  next(error)
  }
}

export { signin, signup, deleteAccount } 
