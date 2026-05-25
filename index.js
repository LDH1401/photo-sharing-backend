const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const dbConnect = require("./db/dbConnect");
const AdminRouter = require("./routes/AdminRouter");
const CommentRouter = require("./routes/CommentRouter");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const PhotoUploadRouter = require("./routes/PhotoUploadRouter");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "photo-sharing-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use("/admin", AdminRouter);
app.use("/user", (request, response, next) => {
  if (request.method === "POST" && request.path === "/") {
    return UserRouter(request, response, next);
  }

  return next();
});

app.use((request, response, next) => {
  if (request.session.userId) {
    return next();
  }

  response.status(401).json({ message: "Unauthorized." });
});

app.use("/user", UserRouter);
app.use("/photosOfUser", PhotoRouter);
app.use("/commentsOfPhoto", CommentRouter);
app.use("/photos", PhotoUploadRouter);
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

dbConnect()
  .then(() => {
    app.listen(8081, () => {
      console.log("server listening on port 8081");
    });
  })
  .catch((error) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
    process.exit(1);
  });
