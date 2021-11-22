'use strict';

require("dotenv").config();
require("express-async-errors");

const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");
const cookieParser = require("cookie-parser");


//* Extra security packages
// Helmet helps you secure your Express apps by setting various HTTP headers
const helmet = require("helmet");
const cors = require("cors");
// Xss sanitize user input coming from POST body, GET queries, and url params
const xss = require("xss-clean");
/* Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset. */
const rateLimiter = require("express-rate-limit");

/** Compress files to production */
const compression = require("compression");


//!* Swagger
/*const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");*/

const express = require("express");
const app = express();


//* Load routers files
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

//* Load error middlewares
const RouteNotFoundMiddleware = require("./middleware/route-not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

/** Express-rate-limit -> Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
* see https://expressjs.com/en/guide/behind-proxies.html
* app.set('trust proxy', 1); 
*/
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

/* const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use("/api/", apiLimiter); */


app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(cookieParser());
app.use(compression());


app.get("/", (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});

//* API Documentation route
//app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//* Rewrite routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter); // require authentication

// errors middlewares
app.use(RouteNotFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start().then(r => console.log('All is ready happy codding'));
