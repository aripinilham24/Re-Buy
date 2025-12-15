import express from "express";
// import router from "router"

const app = express();

app.use(express.json());

app.use("/", (req, res) => {
  res.json({
    code: 200,
    status: "success",
    message: "Hello World",
  });
});

export default app;