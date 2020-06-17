const service = require("../service/index");
const chalk = require("chalk");
const jwt_decode = require("jwt-decode");

function esTurista(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: "No tienes autorizacion" });
  }

  const token = req.headers.authorization.split(" ")[1]; // la cabecera tiene 2 partes, la segunda parte es el token ( separados por un espacio " ")

  if (String(jwt_decode(token).role === "Turista")) {
    console.log(chalk.red(jwt_decode(token).role));
    next();
  } else {
    return res.status(403).send({ message: `Acceso denegado` });
  }
}
module.exports = esTurista;
