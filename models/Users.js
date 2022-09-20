const { default: mongoose } = require("mongoose");
const GeoJSON = require('mongoose-geojson-schema');

const { Schema } = mongoose;

const schema = new Schema({
    // displayName: String,
    // gender: String,
    // message: String,
    // profilePictureUrl: String,
    // position: Schema.Types.Point
    twitterUid: String,
    twitterName: String,
    walletAddress: String,
    NFTCollections: Schema.Types.Array,
    profilePictureUrl: String,
    position: Schema.Types.Point,
    message: String,
    isOnline: Boolean,
});

schema.index({ position: `2dsphere` });

module.exports = mongoose.model(`User`, schema);