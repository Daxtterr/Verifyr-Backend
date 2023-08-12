const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

const paymentRouter = require("./routes/payment.routes");
const companyRouter = require("./routes/companies.routes");
//const job = require("./utils/scheduler")
const connectDB = require("./configs/database");

dotenv.config();
const app = express();
app.enable("trust proxy");
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

connectDB(process.env.MONGO_URI);
//job.start()

app.use(express.json());
app.use(limiter);
app.use("/pay", paymentRouter);
app.use("/company", companyRouter);

app.get("/", async (req, res) => {
  res.send("I am running fast");
});

app.listen(PORT, () => {
  console.log(`Server is running with speed at port ${PORT}`);
});
