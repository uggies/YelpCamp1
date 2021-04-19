const express = require('express');
const router = express.Router();

const Campground = require('../models/campground');

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



router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
        // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400)
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success', 'successfully made a new campground');
        res.redirect(`/campgrounds/${campground._id}`);    
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews')
    // const campground = await Campground.findById(id);
    if( !campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect("/campgrounds");
    } 
    res.render("campgrounds/show", { campground });
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if( !campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect("/campgrounds");
    } 

    res.render("campgrounds/edit", { campground} )
            
    
}))

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    // res.send('It worked');
    
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id,
            { ...req.body.campground });
        req.flash('success', 'successfully updated campground');
        res.redirect(`/campgrounds/${campground._id}`);    
    
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}))


module.exports = router;