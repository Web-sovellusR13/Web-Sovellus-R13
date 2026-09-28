import { expect } from "chai" 
import { initializeTestDb, insertTestUser, getToken } from "./helper/test.js" 

describe("Testing user management", () => { 
  before(async () => { 
    await initializeTestDb() 
  }) 

  const user = { username: "test123", email: "foo2@test.com", password: "Password123" }

  it("should sign up", async () => { 
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: user }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(201) 
    expect(data).to.include.all.keys(["userID", "email"]) 
    expect(data.email).to.equal(user.email) 
  }) 

  it("should not sign up (missing username)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { email: "test@mail.com", password: "Password123" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Please fill up all the fields.") 
  }) 

  it("should not sign up (missing email)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { username: "test6", password: "Password123" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Please fill up all the fields.") 
  }) 

  it("should not sign up (missing password)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { username: "test6", email: "test@mail.com" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Please fill up all the fields.") 
  }) 

  it("should not sign up (too short password)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { username: "test6", email: "test@mail.com", password: "pass" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Password must be at least 8 characters long") 
  }) 

  it("should not sign up (password missing uppercase)", async () => {
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { username: "test6", email: "test@mail.com", password: "password123" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Password must contain at least one uppercase letter") 
  }) 

  it("should not sign up (password missing number)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/signup", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { username: "test6", email: "test@mail.com", password: "Password" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Password must contain at least one number") 
  }) 

  it('should log in', async () => { 
    const response = await fetch("http://localhost:3000/api/user/signin", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(200) 
    expect(data).to.include.all.keys(["email", "token"]) 
    expect(data.email).to.equal(user.email) 
  })

  it('should not log in (password missing)', async () => {
    const response = await fetch("http://localhost:3000/api/user/signin", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { email: user.email } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Email and password are required") 
  })

  it('should not log in (email missing)', async () => {
    const response = await fetch("http://localhost:3000/api/user/signin", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { password: user.password } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Email and password are required") 
  })

  it('should not log in (password wrong)', async () => { 
    const response = await fetch("http://localhost:3000/api/user/signin", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { email: user.email, password: "wrong" } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(401) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Invalid email or password") 
  })

  it('should not log in (email wrong)', async () => { 
    const response = await fetch("http://localhost:3000/api/user/signin", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ user: { email: "wrong", password: user.password } }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(401) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Invalid email or password") 
  })
})

describe("Testing reviews", () => { 
  let token = null 
  const testUser = { username: "test124", userId:1, email: "foo3@test.com", password: "Password123" }

  before(async () => { 
    await initializeTestDb() 
    await insertTestUser(testUser) 
    token = getToken(testUser.email, testUser.userId) 
  }) 

  const testReview = { movieID: 1, review: "test", rating: "5.0" } 

  it("should create a new review", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify(testReview) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(201) 
    expect(data).to.include.all.keys(["movieID", "review", "rating"]) 
    expect(data.movieID).to.equal(testReview.movieID) 
    expect(data.review).to.equal(testReview.review) 
    expect(data.rating).to.equal(testReview.rating) 
  })

  it("should not create a review (missing movieID)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify({ review: testReview.review, rating: testReview.rating }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Movie ID is required") 
  }) 

  it("should not create a review (missing review)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify({ movieID: testReview.movieID, rating: testReview.rating }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Review and rating are required") 
  }) 

  it("should not create a review (missing rating)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify({ movieID: testReview.movieID, review: testReview.review }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Review and rating are required") 
  }) 

  it("should not create a review (rating too low)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify({ movieID: testReview.movieID, review: testReview.review, rating: 0 }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Rating must be between 1 and 5") 
  }) 

  it("should not create a review (rating too high)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify({ movieID: testReview.movieID, review: testReview.review, rating: 6 }) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(400) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Rating must be between 1 and 5") 
  }) 

  it("should not create a review (no token)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(testReview) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(401) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Authentication required") 
  }) 

  it("should not create a review (invalid token)", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews", { 
      method: "post", 
      headers: {  
        "Content-Type": "application/json", 
        Authorization: "Bearer notvalidtoken" 
      }, 
      body: JSON.stringify(testReview) 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(401) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Invalid or expired token") 
  }) 

  it("should get all reviews", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews/1") 
    const data = await response.json() 
    expect(response.status).to.equal(201) 
    expect(data).to.be.an("array").that.is.not.empty 
    expect(data[0]).to.include.all.keys(["revID", "review", "rating", "time", "username"]) 
    expect(data[0].review).to.equal(testReview.review) 
    expect(data[0].rating).to.equal(testReview.rating) 
    expect(data[0].username).to.equal(testUser.username) 
  }) 

  it("should get no reviews for a movie without reviews", async () => { 
    const response = await fetch("http://localhost:3000/api/reviews/999999") 
    const data = await response.json() 
    expect(response.status).to.equal(201) 
    expect(data).to.be.an("array").that.is.empty 
  }) 
})

describe("Testing account deletion", () => { 
  let token = null 
  const testUser = { username: "test125", userId: 1, email: "foo4@test.com", password: "Password123" }

  before(async () => { 
    await initializeTestDb() 
    await insertTestUser(testUser) 
    token = getToken(testUser.email, testUser.userId) 
  }) 

  it("should not delete account (no token)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/me", { 
      method: "delete" 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(401) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Authentication required") 
  }) 

  it("should not delete account (invalid token)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/me", { 
      method: "delete", 
      headers: { Authorization: "Bearer not.a.valid.token" } 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(401) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("Invalid or expired token") 
  }) 

  it("should delete account", async () => { 
    const response = await fetch("http://localhost:3000/api/user/me", { 
      method: "delete", 
      headers: { Authorization: `Bearer ${token}` } 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(200) 
    expect(data).to.include.all.keys(["message"]) 
    expect(data.message).to.equal("User deleted successfully") 
  }) 

  it("should not delete account (already deleted)", async () => { 
    const response = await fetch("http://localhost:3000/api/user/me", { 
      method: "delete", 
      headers: { Authorization: `Bearer ${token}` } 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(404) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("User not found") 
  }) 

  it("should not get profile after deletion", async () => { 
    const response = await fetch("http://localhost:3000/api/user/me", { 
      headers: { Authorization: `Bearer ${token}` } 
    }) 
    const data = await response.json() 
    expect(response.status).to.equal(404) 
    expect(data).to.include.all.keys(["error"]) 
    expect(data.error).to.include.all.keys(["message"]) 
    expect(data.error.message).to.equal("User not found") 
  }) 
})

