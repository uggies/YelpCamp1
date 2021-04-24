const express = require('express');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const router = express.Router();

const Campground = require('../models/campground');

const { campgroundSchema, reviewSchema } = require('../schemas');

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError');

const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({storage} )

const campgrounds = require('../controllers/campgrounds');

router.get('/', catchAsync(campgrounds.index))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

<<<<<<< HEAD
// create new campground
router.post('/', isLoggedIn, upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground))
// router.post('/', upload.array('image'), (req, res) => {
//     console.log(req.body, req.files) 
//     res.send("It worked");
// })
=======
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // const campground = await Campground.findById(id);
    
    if( !campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect("/campgrounds");
    } 
    res.render("campgrounds/show", { campground });
}))
>>>>>>> heroku

router.get('/:id', catchAsync(campgrounds.showCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground))

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;