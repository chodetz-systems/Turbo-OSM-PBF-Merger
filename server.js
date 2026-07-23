import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/merge", upload.fields([{ name: "pbf1" }, { name: "pbf2" }]), (req, res) => {
  const file1 = req.files.pbf1[0].path;
  const file2 = req.files.pbf2[0].path;
  const output = "/tmp/merged.osm.pbf";

  const cmd = `osmium merge ${file1} ${file2} -o ${output}`;

  exec(cmd, (err) => {
    if (err) {
      res.status(500).send("Merge failed");
      return;
    }

    const stream = fs.createReadStream(output);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=merged.osm.pbf");
    stream.pipe(res);
  });
});

app.listen(3000, () => {
  console.log("Turbo OSM PBF Merger running on port 3000");
});
