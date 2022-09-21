const { default: mongoose } = require("mongoose");
const GeoJSON = require("mongoose-geojson-schema");

const { Schema } = mongoose;

const schema = new Schema({
  twitter_id: String,
  twitter_name: String,
  wallet_address: String,
  nft_collections: Schema.Types.Array,
  profile_picture: String,
  position: Schema.Types.Point,
  isOnline: Boolean,
  message: String,
});

schema.index({ position: `2dsphere` });

module.exports = mongoose.model(`User`, schema);
