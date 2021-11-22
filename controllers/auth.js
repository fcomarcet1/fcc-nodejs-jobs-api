'use strict';

const User = require("../models/User");
const {StatusCodes} = require("http-status-codes");
const {BadRequestError, UnauthenticatedError} = require("../errors");

//* Register Action
const register = async (req, res) => {
    // only validate data  with validator if we need change error msg, mongoose validate data
    const user = await User.create({...req.body});

    //?? create token in register
    //const token =user.createJWT();

    res.status(StatusCodes.CREATED).json({
        message: "User created",
        user: {name: user.name},
        //token
    });
};

//* Login Action
const login = async (req, res) => {

    // get email, password from request
    const {email, password} = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }

    // check user in db
    const user = await User.findOne({email});
    if (!user) {
        throw new UnauthenticatedError("Invalid Credentials");
    }

    // compare password is valid
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid Credentials");
    }
    // create jwt token
    const token = user.createJWT();

    res.status(StatusCodes.OK).json({
        message: "User logged in",
        user: {name: user.name},
        token: token

     });
};

module.exports = {
    register,
    login,
};
