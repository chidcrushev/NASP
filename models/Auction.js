const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuctionSchema = new Schema ({
	
	name: String,
	price: Number,
	description : String,
	image: String

});

module.exports = mongoose.model("Auction", AuctionSchema);