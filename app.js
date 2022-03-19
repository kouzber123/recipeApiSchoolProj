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

//weather app keys , setups / 1st request is just placeholder for the page

const key = "c0079132d6f5ae19bb06dadb73eca002";
const units = "metric";
const weather_url = `https://api.openweathermap.org/data/2.5/find?q=helsinki&appid=${key}&units=${units}`;

//parse data and get images into seperate entities for easier printing
app.get("/", (req, res) => {
  https.get(weather_url, (response) => {
    response.on("data", (data) => {
      const weatherData = JSON.parse(data);
      const icon = weatherData.list[0].weather[0].icon;
      const imgURL = `http://openweathermap.org/img/wn/${icon}.png`;
      res.render("home", { weather: weatherData.list[0], img: imgURL });
    });
  });
});

//get requested city/country > this the dynamic part
app.post("/", (req, res) => {
  const country = req.body.country;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/find?q=${country}&appid=${key}&units=${units}`;
  https.get(weatherUrl, (response) => {
    response.on("data", (data) => {
      const weatherData = JSON.parse(data);

      const icon = weatherData.list[0].weather[0].icon;
      const imgURL = `http://openweathermap.org/img/wn/${icon}.png`;
      res.render("home", { weather: weatherData.list[0], img: imgURL });
    });
  });
});

//........................food site starts

//user selected food id
var lookForFood = { recipe: String };

//api keys
const recipeKey = "ea682f9966e033c3ee883f0db5950740";
const recipeID = "d5d60950";

app.get("/foods", (req, res) => {
  res.render("foods");
});

//https req to the edamam with userinput from the url.
app.post("/foods", (req, res) => {
  const recipe = req.body.recipe;
  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${recipe}&app_id=${recipeID}&app_key=${recipeKey}`;

  https
    .get(url, (response) => {
      let data = "";

      response.on("data", (recipeData) => {
        data += recipeData;
      });
      // The whole response has been received. parse data and add into object for later use, data.hits > prettify results
      response.on("end", () => {
        data = JSON.parse(data);
        const foodData = data.hits;
        lookForFood = { recipe: foodData };
        res.render("foodpost", { foodData: foodData });
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
});

//to create new page from the recipe user wants,
//use lookForFood where we saved api data and get data that matches the index, index ? params.id : render the data
app.get("/id/:foodID", (req, res) => {
  const targetArray = lookForFood.recipe;

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
