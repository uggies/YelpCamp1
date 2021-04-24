
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary')

// console.log(mapBoxToken);
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // console.log(geoData.body.features[0].geometry);
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    // cloudianry info is in the req.files
    // console.log(req.files);
    
    const reqImgs = req.files.map(f=> ({url: f.path, filename: f.filename}));
    req.body.campground.geometry = geoData.body.features[0].geometry;
    const campground = new Campground(req.body.campground);
    campground.images = reqImgs;
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);    
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews', 
        populate: {
            path: 'author'
        }}).populate('author');
    // const campground = await Campground.findById(id);
    if( !campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect("/campgrounds");
    } 
    // console.log(campground);
    res.render("campgrounds/show", { campground });
}

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if( !campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect("/campgrounds");
    }
 
    res.render("campgrounds/edit", { campground} )
}

module.exports.updateCampground = async (req, res, next) => {
    // res.send('It worked');
    const { id } = req.params;
    
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const reqImgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    
    // console.log(campground);

    // reset geometry to default if the data is empty
    if ( campground.geometry.coordinates.length === 0) {
        // set default geometry
        campground.geometry = {
            type: 'Point',
            coordinates: [-118.27934, 34.05062]
        }
    }
    // console.log( ...reqImgs);
    // spread array to objects to add existing array
    campground.images.push(...reqImgs);
    await campground.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in:req.body.deleteImages}}}});
        // console.log(campground);
    }
    req.flash('success', 'successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);    
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}