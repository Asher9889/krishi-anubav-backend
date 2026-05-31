import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    cities: [{ // inside array unique does not work here as expected. 
        type: String,
        required: true, 
        trim: true, 
    }],
}, { timestamps: true });

const StateModel = mongoose.model("State", stateSchema);
export default StateModel;
