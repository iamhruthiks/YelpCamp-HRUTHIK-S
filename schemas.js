//jio schema validation has been implemented to prevent anyone from adding a campground via api platforms without filling in all the required fileds
const Joi = require("joi")

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})
//const result = campgroundSchema.validate(req.body)
//console.log(result)

