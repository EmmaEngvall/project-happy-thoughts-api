import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happy-thoughts-project";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const { Schema } = mongoose;
const HappyThoughtSchema = new Schema ({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true
  },
  hearts: {
    type: Number,
    default: 0
    
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Thought = mongoose.model("Thought", HappyThoughtSchema)

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Time for some happy thoughts!");
});

// GET thoughts
app.get("/thoughts", async (req, res) => {
  try {
    const thoughtItem = await Thought.find().sort({
    createdAt: 'desc' }).limit(20).exec()
    res.status(200).json({
      success: true,
      response: thoughtItem,
      message: "thought fetch successful"
    })
  } catch(e) {
    res.status(400).json({
      success: false,
      response: e,
      message: "thought not found"
    })    
  }
})

// POST (create new message entries in the database)
app.post("/thoughts", async (req, res) => {
  const { message } = req.body
    try{
      const thoughtItem = await new Thought ({ message }).save()
      res.status(201).json({
        success: true,
        response: thoughtItem,
        message: "new thought created successfully"
      })
    } catch (e) {
      res.status(400).json({
        success: false,
        response: e,
        message: "error occurred, could not create new thought"
      })
    }
})

// POST (update the number of likes for a message. It is preferred to use PATCH as method.)
app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params
    try{
      const LikedItem = await Thought.findByIdAndUpdate (
        thoughtId,
      { $inc: { hearts: 1 } }, { new: true })
      res.status(201).json({
        success: true,
        response: LikedItem,
        message: "like of thought successful"
      })
    } catch (e) {
      res.status(400).json({
        success: false,
        response: e,
        message: "error occurred, could not like thought"
      })
    }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});