const express = require('express');
const router = express.Router({ mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError');

<<<<<<< HEAD
const reviews = require('../controllers/reviews')

router.post('/',isLoggedIn, validateReview, 
    catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, 
        catchAsync(reviews.deleteReview))
=======
router.post('/',isLoggedIn, validateReview, catchAsync(async (req, res) => {
    // res.send("You made it")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // dont need to await for push
    if ( campground) {
        campground.reviews.push(review._id);
        const savedRev = await review.save();
        // console.log(savedRev);
        await campground.save();
        console.log(savedRev);
        req.flash('success', 'Creted new review');
    }
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    // res.send("DELETE Me!")
    const { id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}))
>>>>>>> heroku

module.exports = router;