const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const JobSchema = new mongoose.Schema({
    company: {
      type: String,
      required: [true, "Please provide company name"],
      maxlength: 50,
      trim: true,
      unique: true,
    },
    position: {
      type: String,
      required: [true, "Please provide position"],
      maxlength: 100,
      trim: true,
    },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
      trim: true,
    },
    // Relation Jobs-User
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

// Do not show fields with private information
/* JobSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.__v;
  //delete obj.status;

  return obj;
}
 */

// Apply the uniqueValidator plugin to userSchema.
JobSchema.plugin(uniqueValidator, {message: "company name is already taken."});

module.exports = mongoose.model("Job", JobSchema);
