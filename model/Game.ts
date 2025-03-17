
import mongoose from "mongoose";


const GameSchema = new mongoose.Schema({
    playerWhite: String,
    playerBlack: String,
    moves: [String],
    winner: String,
    createdAt: { type: Date, default: Date.now },
  });

  export default mongoose.models.Game || mongoose.model("Game", GameSchema);
