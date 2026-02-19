import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const dbName = "node-project";
const collectionName = "todo";
const uri = "mongodb://10.129.200.100";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

const connectDB = async () => {
    try {
        if (!db) {
            await client.connect();
            db = client.db(dbName);
            console.log("Successfully connected to MongoDB!");
        }
        return db;
    } catch (e) {
        console.error("Connection error:", e);
    }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.set("view engine", "ejs");

app.get("/", async (req, resp) => {
    const database = await connectDB();
    const collection = database.collection(collectionName);
    const data = await collection.find({}).toArray();
    // Changed key to 'result' to match your list.ejs variable
    resp.render("list", { result: data }); 
});

app.get("/add", (req, resp) => {
    resp.render("add");
});

app.post("/add", async (req, resp) => {
    const database = await connectDB();
    const collection = database.collection(collectionName);
    const result = await collection.insertOne(req.body);
    if (result.acknowledged) {
        resp.redirect("/");
    } else {
        resp.redirect("/add");
    }
});

app.listen(3201, async () => {
    console.log("Server running on http://localhost:3201");
    await connectDB();
});