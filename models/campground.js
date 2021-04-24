const mongoose = require('mongoose');
const review = require('./review');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// https://res.cloudinary.com/dyyuj2cq2/image/upload/w_300/v1619045843/YelpCamp/bovfgbfbiqohsojnjfoh.jpg
// replace the url with w_200 to transform the image
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON : {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

// properties : {
//     popupMarkup: <h3>title</h3><a href="">link</a>
// }

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<h3>${this.title}</h3>
            <a href="/campgrounds/${this._id}">${this.location}</a>
            <p>${this.description.substring(0,30)}...</p>`;
})

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    // console.log("DELETED!!!");
    // console.log(doc);
    if (doc) {
        await review.deleteMany({
            _id: {
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);

