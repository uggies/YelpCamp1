const express = require('express');
const router = express.Router({ mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const { validateReview} = require('../middleware')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError');

router.post('/',validateReview, catchAsync(async (req, res) => {
    // res.send("You made it")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // dont need to await for push
    if ( campground) {
        campground.reviews.push(review._id);
        const savedRev = await review.save();
        await campground.save();
        console.log(savedRev);
        req.flash('success', 'Creted new review');
    }
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    // res.send("DELETE Me!")
    const { id, reviewId} =req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;