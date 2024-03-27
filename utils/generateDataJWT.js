const jwt = require("jsonwebtoken")

const generateDataJWT = (data) => {
    const dataToken = jwt.sign(
        { data: JSON.stringify(data) },
        process.env.DATA_TOKEN
      );
      return dataToken;
}

module.exports = generateDataJWT