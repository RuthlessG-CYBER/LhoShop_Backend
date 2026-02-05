import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        active: {
            type: Boolean,
            required: true,
            default: true
        },
        type: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model("Products", productSchema);