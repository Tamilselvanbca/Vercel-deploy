const express = require('express')
const app = express()
const port = 3000;
const cors= require('cors');


//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//mongodb config

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mern-book-store:JJ0VbnIUiyw68Jqk@cluster0.hpg4oyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //Create a Database
    const bookcollections=client.db("BookInventory").collection("books");

    //Insert the book using Post method
    app.post("/upload-book", async(req , res)=>{
        const data= req.body;
        const result= await bookcollections.insertOne(data);
        res.send(result);
    })

    //get the all books
    app.get("/all-books", async(req, res)=>{
        const books= bookcollections.find();
        const result= await books.toArray();
        res.send(result);
    })
    
    //update a book
    app.patch("/book:/id", async(req, res)=>{
        const id= req.params.id;
        //console.log(id);
        const updateBookData= req.body;
        const filter= {_id: new ObjectId(id)};
       

        const UpdateDoc= {
            $set: { 
                ...updateBookData
            },
        }
        const options={upsert:true};
        //update
        const result = await bookcollections.updateOne(filter,UpdateDoc,options);
        res.send(result);
    })


    //delete a book from data
    app.delete("/book/:id", async (req, res)=>{
        const id= req.params.id;
        const filter= {_id: new ObjectId(id)};
        const result = await bookcollections.deleteOne(filter);
        res.send(result);
    })

    //find by category
    app.get("/all-books", async(req, res)=>{
        let query ={};
        if(req.query?.category){
            query= {category: req.query.category}
        }
        const result= await bookcollections.find(query).toArray();
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})