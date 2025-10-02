import mongoose, { Schema, model } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const travelSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  points: [
    {
      city: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    }
  ],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  photos : [
    { 
    city: { type: String, required: true },
    urls: [{ type: String }],
    },
  ],
},
{ timestamps: true } 
);

const AutoIncrement = AutoIncrementFactory(mongoose);
travelSchema.plugin(AutoIncrement, { inc_field: "id" });

const Travel = model("Travel", travelSchema);

export default Travel;
