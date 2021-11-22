'use strict';
require('dotenv').config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "Please provide name"],
            maxlength: 50,
            minlength: 3,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide email"],
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please provide a valid email",
            ],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please provide password"],
            minlength: 6,
            trim: true,
        },
    }, {timestamps: true,}
);

//* Generate password hash pre-save Schema with bcryptjs module
UserSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//* getters && setters if we need
UserSchema.methods.getName = function () {
    return this.name;
}

UserSchema.methods.setName = function (name) {
    this.name = name;
}

UserSchema.methods.getEmail = function () {
    return this.email;
}


//* ************ Custom actions ******************

//* Create JWT token
UserSchema.methods.createJWT = function () {
    return jwt.sign(
        {userId: this._id, name: this.name,},
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    );

}
/*UserSchema.methods.createJWT = function () {
    const token = jwt.sign({
        userId: this._id,
        name: this.name,
    }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });

    return token;

    return jwt.sign(
      {userId: this._id, name: this.name},
      process.env.JWT_SECRET,
      {expiresIn: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)} // 1 week
    );
};*/


//* Check if encrypted password is valid
UserSchema.methods.comparePassword = async function (canditatePassword) {
    return await bcrypt.compare(canditatePassword, this.password); // promise<Boolean>
};


// Dont show fields 
UserSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    //delete obj.status;

    return obj;
}

// Apply the uniqueValidator plugin to UserSchema for email field.
UserSchema.plugin(uniqueValidator, {message: "this email is already taken."});

module.exports = mongoose.model("User", UserSchema);
