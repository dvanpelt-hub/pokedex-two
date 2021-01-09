require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
//Hide x-powered-by: Express
const helmet = require("helmet");
const cors = require("cors");
const POKEDEX = require("./pokedex.json");
const app = express();
const validTypes = [
  `Bug`,
  `Dark`,
  `Dragon`,
  `Electric`,
  `Fairy`,
  `Fighting`,
  `Fire`,
  `Flying`,
  `Ghost`,
  `Grass`,
  `Ground`,
  `Ice`,
  `Normal`,
  `Poison`,
  `Psychic`,
  `Rock`,
  `Steel`,
  `Water`,
];

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
//Place helmet before cors
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");
  //Checks to see if either no authentication token is entered or if the entered token doesn't match the 'secret' token env var.
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  //move to next middleware
  next();
});

function handleGetTypes(req, res) {
  res.json(validTypes);
}

//Using the callback function "handleGetTypes" to format response
app.get("/types", handleGetTypes);

app.get("/pokemon", function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;

  // filter our pokemon by name if name query param is present
  if (req.query.name) {
    response = response.filter(pokemon => 
  // case insensitive searching
      pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }
  if (req.query.type) {
  // filter our pokemon by type if type query param is present
    response = response.filter(pokemon => 
      pokemon.type.includes(req.query.type)
    );
  }
  res.json(response);
});

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
