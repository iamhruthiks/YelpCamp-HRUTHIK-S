//campground model basics
const mongoose = require("mongoose")
const Review = require("./review")
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload")
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: { //adding an author to to the campground
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

CampgroundSchema.virtual("properties.popUpMarkupTitle").get(function () {
    return `${this.title}`;
})

CampgroundSchema.virtual("properties.popUpMarkupId").get(function () {
    return `${this._id}`;
})

CampgroundSchema.virtual("properties.popUpMarkupDesc").get(function () {
    return `${this.description.substring(0, 80)}`;
})


//query middleware -> to delete all the reviews, which are associated with the deleted campgrounds
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    // console.log(doc)
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }

})

module.exports = mongoose.model("Campground", CampgroundSchema)