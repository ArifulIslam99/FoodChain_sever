const express = require('express');
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(cors());
app.use(express.json());
const fileUpload = require("express-fileupload");
app.use(fileUpload())
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4ayip9w.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const products = client.db("foodchain").collection("products");
    const distributors = client.db("foodchain").collection("logistics");
    const userCollecton = client.db("foodchain").collection("users");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = products.find({});
      const allProducts = await cursor.toArray();
      res.json(allProducts)
    })

    // Update User on the database
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      };
      const result = await userCollecton.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    // Update Single User Role

    // Update User on the database
    app.put("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const role = req.body.role;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: role
        }
      };
      const result = await userCollecton.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    // Get all users information

    app.get("/users", async (req, res) => {
      const users = await userCollecton.find().toArray();
      res.send(users)
    })

    //Get Single User Information

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await userCollecton.findOne(filter);
      res.json(user);
    })

    // Create a New Inspection Request
    app.post('/products', async (req, res) => {
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString('base64')
      const image = Buffer.from(encodedPic, 'base64');

      const name = req.body.name;
      const description = req.body.description;
      const price = req.body.price;
      const unit = req.body.unit;
      const status = req.body.status;
      const contractAddress = req.body.contractAddress;

      const data = { name: name, description: description, price: price, unit: unit,
        logisticAdress: null, retailerAdress: null, 
        status: status, contractAddress: contractAddress , seller: req.body.email, img: image }

      const result = await products.insertOne(data);
      res.json(result)
    })

    // Create a New Logistic Request
    app.post('/distributors', async (req, res) => {
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString('base64')
      const image = Buffer.from(encodedPic, 'base64');

      const name = req.body.name;
      const basePrice = req.body.basePrice;
      const fair_kg = req.body.fair_kg;
      const fair_kilo = req.body.fair_kilo;

      const data = { name: name, basePrice: basePrice, fair_kg: fair_kg, fair_kilo: fair_kilo, seller: req.body.email, img: image }
      const result = await distributors.insertOne(data);
      res.json(result)
    })

    // Get all Products 

    app.get("/products", async (req, res) => {
      const products = await products.find().toArray();
      res.json(products)
    })


    // Get all distributors 

    app.get("/distributors", async (req, res) => {
      const logistics = await distributors.find().toArray();
      res.json(logistics)
    })

    // Make an User Admin

    app.put('/users/admin', async ( req, res) =>{
      const email = req.body.email;
      const filter = {email: email}
      const updateDoc = {$set:{ role:"admin"}}
      const result = await userCollecton.updateOne(filter, updateDoc)
      res.json(result)
  })

  
      // Remove an user

      app.delete('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const filter = { email : email};
        const query = await userCollecton.deleteOne(filter)
        res.json(query)
      })

      // Update Product Status

      app.put("/product/:id", async(req, res)=>{
        const id = req.params;
        const filter = { _id : ObjectId(id)};
        const updateDoc = { $set : {status: 'approved'} }
        const result = await products.updateOne(filter, updateDoc)
        res.json(result)
      })

      // Handle Logistic Request

      app.put("/product/addlogistic/:id", async(req, res)=>{
        const id = req.params;
        const filter = { _id : ObjectId(id)};
        const logisticAdress = req.body.logisticAdress;
        const updateDoc = { $set : { logisticAdress: logisticAdress}}
        const result = await products.updateOne(filter, updateDoc)
        res.json(result)
      })
      // Handle Retailer Request

      app.put("/product/addRetailer/:id", async(req, res)=>{
        const id = req.params;
        const filter = { _id : ObjectId(id)};
        const retailerAdress = req.body.retailerAdress;
        const updateDoc = { $set : { retailerAdress: retailerAdress}}
        const result = await products.updateOne(filter, updateDoc)
        res.json(result)
      })
      // uPDATE Sold Status

      app.put("/product/sold/:id", async(req, res)=>{
        const id = req.params;
        const filter = { _id : ObjectId(id)};
        
        const updateDoc = { $set : { sell_status: "sold"}};
        const result = await products.updateOne(filter, updateDoc)
        res.json(result)
      })



  }
  finally {

  }
}

run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Hello From Server!')
})

app.listen(port, () => {
  console.log(`FoodChain app listening on port ${port}`)
})


