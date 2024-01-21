const jwt = require("jsonwebtoken");

const checkAuthorization = (req, res) => {
    try {
        const receivedJwt = req.headers["authorization"];
        console.log(`receivedJwt : ${receivedJwt}`);

        if (receivedJwt) {
            const decodedPayload = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
            return decodedPayload;
        } else {
            throw new ReferenceError("jwt must be provied");
        }
    } catch (err) {
        console.log(err.name);
        console.log(err.message);

        return err;
    }
};

module.exports = checkAuthorization;
