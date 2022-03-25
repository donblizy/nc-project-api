const { expect } = require("chai");

const app = require("../app");
const data = require("../db/data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const petsRouter = require("../routes/pets-router");

beforeEach(() => seed(data));

describe("app", () => {
  describe("/users", () => {
    describe("GET", () => {
      it(`should have a status of 200 and return a list of all users on
          a key of 'users'. Each user is an object containing string values
          under the keys of 'userId' and 'username'`, () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users).to.have.lengthOf(5);
            users.forEach((user) => {
              expect(user.userId).to.be.a("string");
              expect(user.username).to.be.a("string");
            });
          });
      });
    });
    describe("POST", () => {
      it(`should have a status of 201 and return a new user object under
          the key of user`, () => {
        return request(app)
          .post("/api/users")
          .send({ username: "newUser" })
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).to.be.a("string");
          })
          .then(() => {
            return request(app)
              .get("/api/users")
              .expect(200)
              .then(({ body: { users } }) => {
                expect(users).to.have.lengthOf(6);
              });
          });
      });
      it(`should have a status 400 with "missing required field" on a key of msg
          when the request body is missing a field`, () => {
        return request(app)
          .post("/api/users")
          .send({})
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("missing required field");
          });
      });
      it(`should have a status 400 with "username taken" on a key of msg when the
          username is already taken`, () => {
        return request(app)
          .post("/api/users")
          .send({ username: "username1" })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("username taken");
          });
      });
    });
  });

  describe("/users/:userId", () => {
    describe("GET", () => {
      it("should have a status 200 with the requested user object on a key of user", () => {
        return request(app)
          .get("/api/users/user0")
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user.username).to.equal("username0");
          });
      });
    });
    describe("DELETE", () => {
      it(`should have a status of 204 and the specified user should be removed from db`, () => {
        return request(app)
          .delete("/api/users/user4")
          .expect(204)
          .then(() => {
            return request(app).get("/api/users").expect(200);
          })
          .then(({ body: { users } }) => {
            expect(users).to.have.lengthOf(4);
          });
      });
      it(`should have a status of 404 with 'no user with that userId' on a key of msg
          when the :userId doesn't exist in the databse`, () => {
        return request(app)
          .delete("/api/users/user999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("no user with that userId");
          });
      });
    });
    describe("PATCH", () => {
      it(`should have a status of 200`, () => {
        return request(app)
          .patch("/api/users/user0")
          .send({ username: "updatedUsername" })
          .expect(200);
      });
      it(`should have a status of 404 with 'no user with that userId' on a key of msg
          when the :userId doesn't exist in the databse`, () => {
        return request(app)
          .patch("/api/users/user999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("no user with that userId");
          });
      });
    });
  });
  describe("/pets", () => {
    describe("GET", () => {
      it(`should have a status of 200 and return a list of all pets on
          a key of 'pets'. Each pet is an object containing string values
          under the keys of 'petId', 'name', 'species', 'desc' and 'img'
          as well as an int on the key of age`, () => {
        return request(app)
          .get("/api/pets")
          .expect(200)
          .then(({ body: { pets } }) => {
            expect(pets).to.have.lengthOf(5);
            pets.forEach((pet) => {
              expect(pet.petId).to.be.a("string");
              expect(pet.name).to.be.a("string");
              expect(pet.species).to.be.a("string");
              expect(pet.desc).to.be.a("string");
              expect(pet.img).to.be.a("string");
              expect(pet.age).to.be.a("number");
            });
          });
      });
      it(`should have a status of 200 and return a filtered list of pets by species`, () => {
        return request(app)
          .get("/api/pets?species=species0")
          .expect(200)
          .then(({ body: { pets } }) => {
            expect(pets).to.have.lengthOf(2);
            pets.forEach((pet) => {
              expect(pet.species).to.equal("species0");
            });
          });
      });
    });
  });
  describe("/pet", () => {
    describe("GET", () => {
      it.only(`should have status of 200 and return pet object with string values under the keys of 'petId', 'name', 'species', 'desc' and 'img'
      as well as an int on the key of age `, () => {
        return request(app)
          .get("/api/pets/pet0")
          .expect(200)
          .then(({ body: { pet } }) => {
            expect(pet).to.equal({
              age: 1,
              desc: "pet0 desc",
              img: "https://img.com",
              lat: -1.069876,
              long: 51.6562,
              name: "pet0",
              species: "species0",
              petId: "pet0",
            });
          });
      });
    });
  });
});
