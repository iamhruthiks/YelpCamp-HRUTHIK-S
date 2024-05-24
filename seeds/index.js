//seeding campgrounds
const Campground = require("../models/campground") //note: ../ ->casue your insidde the seeds folder
const mongoose = require('mongoose')
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp-hruthik-s')
    .then(() => {
        console.log("connection to mongoose is sucesssfull")
    })
    .catch(err => {
        console.log("connection to mongoooe has failed")
        console.log(err)
    })

const sample = (array) => array[Math.floor((Math.random()) * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    //const c = new Campground({ title: "new campground" })
    //await c.save()
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // my user id
            author: "66475dbca062b3f6bb194b02",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: "https://source.unsplash.com/collection/483251", //adding images
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae officiis dolore mollitia vitae rem accusantium, reiciendis harum, ullam aspernatur in quasi cum tempore sapiente sunt cupiditate optio, excepturi commodi. Corporis!",
            price,
            geometry: {
                type: 'Point',
                coordinates: [-113.13265, 47.020008]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dkl32ao2n/image/upload/v1716258509/YelpCamp/wbxnxxkebefyfv9jrued.jpg',
                    filename: 'YelpCamp/wbxnxxkebefyfv9jrued',
                },
                {
                    url: 'https://res.cloudinary.com/dkl32ao2n/image/upload/v1716258510/YelpCamp/bepkq9pnmejbo9inpexg.jpg',
                    filename: 'YelpCamp/bepkq9pnmejbo9inpexg',
                }
            ]
        })
        await camp.save()
    }

}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("connection to mongoose db has been closed")
})
//run-> node seeds/index.js in terminal