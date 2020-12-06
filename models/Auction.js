const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuctionSchema = new Schema({
	title: String,
	image: String,
	price: Number,
	description: String,
	category: String,
	setTime: String,
	highestBid: Number,
	highestBidderName: String,
	status: String,
	reviews: [{
		type: Schema.Types.ObjectId,
		ref: 'Review'
	}],
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});
module.exports = mongoose.model("Auction", AuctionSchema);