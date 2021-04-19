
const mongoose = require('mongoose');

const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelpcamp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database connected");
})

const sample = (arrry) => arrry[Math.floor(Math.random()*arrry.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    // const c = new Campground({
    //     title: 'purple field'
    // })
    // await c.save();
    for(let i=0; i<50; i++) {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis provident debitis temporibus fuga saepe error sequi, repellat facilis deserunt eveniet doloremque tenetur quisquam aut possimus excepturi necessitatibus sint neque! Nisi.',

        })
        await camp.save();
    }   
}

seedDb().then(() => {
    mongoose.connection.close();
})

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({
//         title: 'My backyard',
//         description: 'Cheap camping'
//     })
//     await camp.save();
//     res.send(camp);
// })
