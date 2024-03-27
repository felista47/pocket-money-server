const express = require("express");
const path = require("path");
const app = express();

const connectDB = require("./database");
connectDB();

// Middleware to parse JSON
app.use(express.json());
 
const paymentRoute= require("./routes/paymentRoute")
app.use("/payment", paymentRoute);

const vendorRouter = require('./routes/vendors')
app.use('/vendor',vendorRouter)

const parentRouter = require('./routes/parents')
app.use('/parent',parentRouter)

const childRouter = require('./routes/Child')
app.use('/student',childRouter)

const productRouter = require('./routes/products')
app.use('/product',productRouter)

const server = app.listen(process.env.PORT || 5000);
const portNumber = server.address().port;
console.log(`Server is running on port ${portNumber}`);