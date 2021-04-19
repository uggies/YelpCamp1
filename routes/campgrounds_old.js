const Campground = require('../models/campground');
const Review = require('../models/review');

const { campgroundSchema, reviewSchema } = require('../schemas');

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if ( error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
//    console.log(result);
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if ( error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const campgroundRoutes = (app) => {

    app.get('/campgrounds', async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    })
    
    app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
            // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    
            const campground = new Campground(req.body.campground);
            await campground.save();
            res.redirect(`/campgrounds/${campground._id}`);    
        
    }))
    
    app.get('/campgrounds/new', (req, res) => {
        res.render('campgrounds/new');
    })
    
    app.get('/campgrounds/:id', catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate('reviews')
        // const campground = await Campground.findById(id);
        // console.log(campground);
    
        if( campground) {
            res.render("campgrounds/show", { campground });
        } 
    }))
    
    app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
        
            const { id } = req.params;
            const campground = await Campground.findById(id);
    
            if (campground) {
                res.render("campgrounds/edit", { campground} )
            }    
        
    }))
    
    app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
        // res.send('It worked');
        
            const { id } = req.params;
            const campground = await Campground.findByIdAndUpdate(id,
                { ...req.body.campground });
            res.redirect(`/campgrounds/${campground._id}`);    
        
    }))
    
    app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    }))
    
    app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async (req, res) => {
        // res.send("You made it")
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        // dont need to await for push
        campground.reviews.push(review._id);
        const savedRev = await review.save();
        await campground.save();
        console.log(savedRev);
        res.redirect(`/campgrounds/${campground._id}`);
    }))
    
    app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
        // res.send("DELETE Me!")
        const { id, reviewId} =req.params;
        await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    }))
}

module.exports = campgroundRoutes;