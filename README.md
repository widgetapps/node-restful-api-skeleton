# node-restful-api-skeleton

Yes, another bunch of NodeJS that helps you create a RESTful API. I was working on a new
project that needed strong authentication and authorization. As I worked my way through the code,
it looked like what I had just might be useful to others. I put that work on hold to take some
time to document what I built and to commit the code here on GitHub for anyone to use.

## Getting Started

This is fully functional, here are the steps to get the little scafford working.

1. Be sure you have MongoDB (4.x is best) and NodeJS (10.x is best) installed.
2. Clone the repo.
3. `cd` into the cloned directory.
4. Run `npm install`
5. `cd tools` to run the DB reset script.
6. Run `node reset-db.js` - this will create the first user.
7. `cd ..` to get back into the project root.
8. Run `node server.js`

Then fire up your favourite RESTful URL (I use [Postman](https://www.getpostman.com/) but also
including the cURL commands) tool to test.

## Why This Might Be Useful

If you're very comfy with NodeJS, ExpressJS & MongooseJS, you'll be able to jump right into this code -
there really isn't anything else you need to know. This project gives you the following features:

* Logical directory structure for config, routes, middleware, controllers, models and custom code (lib).
* Config ready to development & production environments (can easily be extended for staging and beyond).
* Authentication using JSON Web Tokens (JWT) signed with RSA key pairs.
* Authorization using Access Control Lists (ACL).
* Models to store Users & Refresh Tokens.
* Routes & Controllers for required authentication, user management and token management.
* A little tool to populate the first user in your MongoDB.

---
## Endpoints

These are the endpoints that will work right out of the box.

### Authentication

**POST /auth/login**

Use this to login. The access token (a JWT) expires in 15 minutes.

cURL:
```
curl -X POST \
  http://localhost:3101/auth/login \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	"email": "admin@example.com",
	"password": "12345678"
}'
```

Request Body:
```
{
    "email": "admin@example.com",
    "password": "12345678"
}
```
Response:
```
   "message": "Login successful.",
   "jwt": "{JSON Web Token - the access token to make authenticated REST reqests}",
   "publicKey": "{Public key used to verify the JWT signature}",
   "refreshToken": "{The refresh token that can be used to request a new JWT access token}"
```
---
**POST /auth/token{refreshToken}**

Use this endpoint to request a new access token without the need to reauthenticate.

cURL:
```
curl -X POST \
  http://localhost:3101/auth/token/{refreshToken} \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	"userId": "5cb6422d37356b03922f5235"
}'
```

Request Body:
```
{
    "userId": "{MongoDB user _id found in the JWT}"
}
```

Response:
```
{
    "message": "JWT has been refreshed.",
    "jwt": "{JSON Web Token - the access token to make authenticated REST reqests}",
    "publicKey": "{Public key used to verify the JWT signature}"
}
```
---
**GET /auth/validate**

Used to validate that the authentcation headers are good.

cURL:
```
curl -X GET \
  http://localhost:3101/auth/validate \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}'
```

Response:
```
{
    "message": "The request is valid."
}
```

### Required HTTP Headers for Authenticated Requests

When you login and get your JWT or you refresh to get an updated JWT, you will get back the JWT 
that you must include in all authenticated API requests. The JWT also contains the user _id that
you will also need to include in the HTTP request headers. If you need to easily decode your JWT,
you can use [jwt.io](https://jwt.io/). Simply copy the JWT from the response and paste there. It
will decode the JWT content, showing you the complete user record including the `_id` field.

Here are the two headers that you must include to make requests to authenticated endpoints (the
validate endpoint above is authenticated, look at the cURL command).

```
x-access-token: {JWT}
x-user-id: {user _id}
```

### Users

**GET /users**

This returns an array of all users in the Users collection. If the role of the currently logged in
user is `user` then this will only return one document, which would be their document.

cURL:
```
curl -X GET \
  http://localhost:3101/users \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}'
```

Response:
```json
[
    {
        "active": true,
        "_id": "5cb6422d37356b03922f5235",
        "firstName": "Super",
        "lastName": "Admin",
        "email": "admin@example.com",
        "role": "super",
        "created": "2019-04-16T20:59:25.493Z",
        "updated": "2019-04-17T01:32:18.016Z"
    }
]
```
---
**POST /users**

Used to add a new user to the system.

cURL:
```
curl -X POST \
  http://localhost:3101/users \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}' \
  -d '{
	"firstName": "Test",
	"lastName": "User",
	"email": "test@example.com",
	"password": "09876543"
}'
```

Request Body:
```json
{
	"firstName": "Test",
	"lastName": "User",
	"email": "test@example.com",
	"password": "09876543"
}
```

Response:
```json
{
    "active": true,
    "_id": "5cb637eb3cbe9f032c211bd3",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "user",
    "created": "2019-04-16T20:15:39.506Z",
    "updated": "2019-04-16T20:15:39.511Z",
    "__v": 0
}
```
---
**GET /users/{userId}**

Returns a single user document. A user with the `user` role can only view their own document.

cURL:
```
curl -X GET \
  http://localhost:3101/users/5cb637eb3cbe9f032c211bd3 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}' \
  -d '{}'
```

Response:
```json
{
    "active": true,
    "_id": "5cb637eb3cbe9f032c211bd3",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "user",
    "created": "2019-04-16T20:15:39.506Z",
    "updated": "2019-04-16T20:15:39.511Z"
}
```
---
**PATCH /users/{userId}**

Used to update select fields in the user document. Can update any number of fields in any order.

cURL:
```
curl -X PATCH \
  http://localhost:3101/users/5cb637eb3cbe9f032c211bd3 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}' \
  -d '{
	"firstName": "Test"
}'
```

Request Body:
```json
{
	"firstName": "Test"
}
```

Response:
```json
{
    "active": true,
    "_id": "5cb637eb3cbe9f032c211bd3",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "user",
    "created": "2019-04-16T20:15:39.506Z",
    "updated": "2019-04-16T20:19:14.715Z",
    "__v": 0
}
```
---
**DELETE /users/{userId}**

Used to delete a user. Only users with the `super` role can delete users and a user cannot delete
themselves.

cURL:
```j
curl -X DELETE \
  http://localhost:3101/users/5cb5de628364fe00f7151574 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}' \
  -d '{}'
```

Response:
```json
{
     "message": "The user has been removed."
}
```

### Tokens

**GET /tokens**

Used to get an array of refresh tokens.

cURL:
```
curl -X GET \
  http://localhost:3101/tokens \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}'
```

Response:
```json
[
    {
        "_id": "5cb6423d0273e7039e006342",
        "token": "{refreshToken}",
        "expiry": "2019-04-23T20:59:41.000Z",
        "user": "5cb6422d37356b03922f5235",
        "created": "2019-04-16T20:59:41.493Z",
        "updated": "2019-04-16T20:59:41.497Z",
        "__v": 0
    }
]
```
---
**GET /tokens/{refreshToken}**

Used to get a single refresh token.

cURL:
```j
curl -X GET \
  http://localhost:3101/tokens/5cb5e3acf3b33f0141a50891 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}' \
  -d '{}'
```

Response:
```json
{
    "_id": "5cb5e3acf3b33f0141a50891",
    "token": "{refreshToken}",
    "expiry": "2019-04-23T14:16:12.000Z",
    "user": "5cb5de628364fe00f7151574",
    "__v": 0,
    "created": "2019-04-16T20:33:02.351Z"
}
```
---
**DELETE /tokens/{refreshToken}**

Used to delete a single refresh token.

cURL:
```
curl -X DELETE \
  http://localhost:3101/tokens/5cb5e3acf3b33f0141a50891 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-access-token: {JWT}' \
  -H 'x-user-id: {user _id}' \
  -d '{}'
```

Response:
```json
{
    "message": "The token has been removed."
}
```
