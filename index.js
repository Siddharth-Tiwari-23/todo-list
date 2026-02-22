import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

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

app.get("/delete/:id", async (req, resp) => {
    const db = await connectDB();
    const collection = db.collection(collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount > 0) {
        resp.redirect("/");
    } else {
        resp.send("Error: Could not delete the item.");
    }
});

app.get("/update/:id", async (req, resp) => {
    const db = await connectDB();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (result) {
        resp.render("update", { result: result });
    } else {
        resp.send("Error: Could not delete the item.");
    }
});

app.post("/update/:id", async (req, resp) => {
    const db = await connectDB();
    const collection = db.collection(collectionName);
    const filter = { _id: new ObjectId(req.params.id) };
    const updateData = { 
        $set: { 
            title: req.body.title, 
            description: req.body.description 
        } 
    };
    const result = await collection.updateOne(filter, updateData);
    if (result.matchedCount > 0) { 
        resp.redirect("/");
    } else { 
        resp.send("Error: Could not find the task to update."); 
    }
});

app.post("/multi-delete", async (req, resp) => {
    const db = await connectDB(); 
    const collection = db.collection(collectionName);
    
    let selectedTask;

    if (!req.body.selectedTask) {
        return resp.redirect("/");
    }
    
    if (Array.isArray(req.body.selectedTask)) {
        selectedTask = req.body.selectedTask.map((id) => new ObjectId(id));
    } else {
        selectedTask = [new ObjectId(req.body.selectedTask)];
    }

    const result = await collection.deleteMany({ _id: { $in: selectedTask } });

    if (result.deletedCount > 0) {
        resp.redirect("/");
    } else {
        resp.send("Some error occurred during deletion.");
    }
});

app.listen(3201, async () => {
    console.log("Server running on http://localhost:3201");
    await connectDB();
});