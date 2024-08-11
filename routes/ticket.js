var express = require("express");
var router = express.Router();
var https = require("https");
var Stream = require("stream").Transform;
var path = require("path");
var fs = require("fs");
var pdf = require("pdf-creator-node");

router.get("/:data", (req, res) => {
  const data = req.params.data;
  console.log(data);

  https.get(
    `https://api.qrserver.com/v1/create-qr-code/?size=2048x2048&data=${data}`,
    (result) => {
      let img = new Stream();
      result.on("data", (chunk) => {
        img.push(chunk);
      });

      result.on("end", () => {
        const filesDir = path.join(__dirname, `../public/pdf`);
        let filname = filesDir + "/qr.png";
        fs.writeFileSync(filname, img.read());

        const html = fs.readFileSync(
          path.join(__dirname, "../views/teraticket.html"),
          "utf-8"
        );

        var options = {
          width: "1060px",
          height: "1065px",
          border: "5mm",
        };

        var users = [
          {
            imgurl: `http://localhost:3000/static/pdf/qr.png`,
          },
        ];

        var document = {
          html: html,
          data: {
            users: users,
          },
          path: "../../public/pdf/output.pdf",
          type: "",
        };
        pdf
          .create(document, options)
          .then(() => {
            var dataPDF = fs.readFileSync("../../public/pdf/output.pdf");
            res.contentType("application/pdf");
            res.send(dataPDF);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }
  );
});

module.exports = router;
