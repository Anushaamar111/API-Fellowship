# 📚 API-Fellowship Project

This project is a custom Express.js API server that performs CRUD operations on a MongoDB database using Mongoose. It manages book records and includes full unit, integration, and API test coverage using Jest and Supertest.

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Testing:** Jest, Supertest, MongoMemoryServer (in-memory DB for testing)
- **Other Tools:** dotenv, nodemon

---

## 📌 API Endpoints

All endpoints are prefixed with `/api`

| Method | Endpoint           | Description             |
|--------|--------------------|-------------------------|
| POST   | `/add`             | Add a new book          |
| GET    | `/books`           | Get all books           |
| GET    | `/books/:id`       | Get a single book by ID |
| PUT    | `/books/:id`       | Update a book by ID     |
| DELETE | `/books/:id`       | Delete a book by ID     |

### 📥 Sample POST Request (Add Book)

```json
POST /api/add
Content-Type: application/json

{
  "name": "The Alchemist",
  "author": "Paulo Coelho",
  "price": 299,
  "description": "A philosophical novel about destiny."
}

git clone https://github.com/Anushaamar111/API-Fellowship.git
cd API-Fellowship
npm install
npm test


![image](https://github.com/user-attachments/assets/66184e9f-676d-4094-abc5-1d0e8a43b007)
