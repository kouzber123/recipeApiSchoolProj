//req high prio modules
const https = require("https");
const express = require("express");
//middle wares
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

//-----------------routes
// for user selected food id
var lookFor = {
  label: String,
};

app.get("/", (req, res) => {
  const key = "c0079132d6f5ae19bb06dadb73eca002";
  const units = "metric";
  const url = `https://api.openweathermap.org/data/2.5/find?q=helsinki&appid=${key}&units=${units}`;
  https.get(url, (response) => {
    response.on("data", (data) => {
      const weatherData = JSON.parse(data);
      const icon = weatherData.list[0].weather[0].icon;
      const imgURL = `http://openweathermap.org/img/wn/${icon}.png`;
      res.render("home", { weather: weatherData.list[0], img: imgURL });
    });
  });
});
//get requested city/country
app.post("/", (req, res) => {
  const country = req.body.country;
  const url = `https://api.openweathermap.org/data/2.5/find?q=${country}&appid=${key}&units=${units}`;
  https.get(url, (response) => {
    response.on("data", (data) => {
      const weatherData = JSON.parse(data);

      const icon = weatherData.list[0].weather[0].icon;
      const imgURL = `http://openweathermap.org/img/wn/${icon}.png`;
      res.render("home", { weather: weatherData.list[0], img: imgURL });
    });
  });
});

app.get("/foods", (req, res) => {
  res.render("foods");
});

app.post("/foods", (req, res) => {
  //fetch data from edamam
  const recipe = req.body.recipe;
  const recipeKey = "ea682f9966e033c3ee883f0db5950740";
  const recipeID = "d5d60950";
  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${recipe}&app_id=${recipeID}&app_key=${recipeKey}`;
  https
    .get(url, (response) => {
      let data = "";
      // A chunk of data has been received.
      response.on("data", (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      //render new file
      response.on("end", () => {
        data = JSON.parse(data);
        const foodData = data.hits;
        lookFor = {
          label: foodData,
        };
        res.render("foodpost", { foodData: foodData });
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
});
app.get("/foodName/:foodlabel/id/:foodID", (req, res) => {
  const targetArray = lookFor.label;

  const index = req.params.foodID;
  if (targetArray[index]) {
    const recipe = targetArray[index].recipe;
    res.render("compose", { foodData: recipe });
  } else {
    console.log("No matching found");
  }
});
//................
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("running on port " + port);
});
