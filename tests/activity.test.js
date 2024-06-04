
const mongoose = require("mongoose");
const request = require("supertest");

const {app, serverPort} = require("../server");
require("dotenv").config();

let response;

/*
beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  /* Closing database connection after each test. */
/*
beforeAll(done => {done()})

afterAll(done => {
// Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close()
    done()
    })
 
afterEach(async () => {
await mongoose.connection.close();
});
*/



describe("Login User", () => {
it("should login the correct user", async () => {
    response = await request(app).post("/api/login").send({
    login: "A",
    password: "AT",
    });

    //console.log("Before status");
    //console.log(response.statusCode);
    //console.log(response.body.id);
    //console.log("After status");

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe("642d43dfdc7bbc78b014c82c");
    //await mongoose.connection.close();
    });

});


///*
describe("Add recipe", () => {
    it("should add recipe", async () => {
        
        response = await request(app).post("/api/addrecipe").send({
        userId: "2",
        recipeName: "A new recipe to add",
        time: [2,30], 
        difficulty: 3, 
        description: "words", 
        ingredients: ["sugar","salt"], 
        equipment: ["spoon","fork"], 
        instructions:["step1","step2"], 
        image:"imageLink", 
        jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDJkNDNkZmRjN2JiYzc4YjAxNGM4MmMiLCJmaXJzdE5hbWUiOiJBIiwibGFzdE5hbWUiOiJUIiwiaWF0IjoxNjgxMDUyNTg4fQ.vntONN6r2JkJR_PUsx1K0NmaFFUWYXgzG_EGu9CJm00",
        });
    
        //console.log("Before status");
        //console.log(response.statusCode);
        //console.log(response.body.id);
        //console.log("After status");
        
        expect(response.statusCode).toBe(200);

        const addResults = await Recipe.find({ "RecipeName": "A new recipe to add"});

        //console.log(results[0].Description);
        expect(addResults[0].Description).toBe("words");
        
        //await mongoose.connection.close();
        });
    
    });
//*/


describe("Delete recipe", () => {
    it("should delete recipe", async () => {
        response = await request(app).post("/api/deleterecipe").send({
        recipeId:"6432d67c970b34eeda2ef30d",
        jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdE5hbWUiOiJBIiwibGFzdE5hbWUiOiJUIiwiaWF0IjoxNjgxMDUzMzA4fQ.l0ljGGjM28a8jFnVHNP77aKDiu0XrmYY2GKYWp18gjU"
        });
    
        //console.log("Before status");
        //console.log(response.statusCode);
        //console.log(response.body.id);
        //console.log("After status");
    
        expect(response.statusCode).toBe(200);
        const deleteResults = await Recipe.findOne({ "_id": "6432d67c970b34eeda2ef30d"});
        
        
        //console.log(deleteResults);

        expect(deleteResults).toBe(null);
        

        });
    
    });

afterAll(() => { console.log('closing...'); serverPort.close(); });


