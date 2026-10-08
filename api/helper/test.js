import fs from 'fs/promises' 
import path from 'path' 
import { pool } from '../models/db.js' 
import { hash } from 'bcrypt'
import jwt from "jsonwebtoken";

const __dirname = import.meta.dirname 

const initializeTestDb = async () => { 
  const sql = await fs.readFile(path.resolve(__dirname, '../test-db.sql'), 'utf8') 
  await pool.query(sql) 
} 

const insertTestUser = async (user) => { 
  const hashedPassword = await hash(user.password, 10) 
  await pool.query( 
    'INSERT INTO public.app_users (username, email, password) VALUES ($1, $2, $3)',
    [user.username, user.email.toLowerCase(), hashedPassword], 
  ) 
} 

const getToken = (email, userId) =>{ 
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' }) 
}

export { initializeTestDb, insertTestUser, getToken } 
