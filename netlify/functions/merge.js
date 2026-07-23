import formidable from "formidable";
import fs from "fs";
import { parse } from "osm-pbf-parser";
import { Pbf } from "osm-pbf";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed"
    };
  }

  return new Promise((resolve) => {
    const form = formidable({ multiples: false });

    form.parse(event, async (err, fields, files) => {
      if (err) {
        resolve({
          statusCode: 400,
          body: "Upload error"
        });
        return;
      }

      const pbf1 = files.pbf1?.filepath;
      const pbf2 = files.pbf2?.filepath;

      if (!pbf1 || !pbf2) {
        resolve({
          statusCode: 400,
          body: "Both PBF files are required"
        });
        return;
      }

      const data1 = await parse(fs.createReadStream(pbf1));
      const data2 = await parse(fs.createReadStream(pbf2));

      const merged = {
        nodes: [...(data1.nodes || []), ...(data2.nodes || [])],
        ways: [...(data1.ways || []), ...(data2.ways || [])],
        relations: [...(data1.relations || []), ...(data2.relations || [])]
      };

      const pbf = new Pbf();
      pbf.writeMessage(merged);

      const buffer = Buffer.from(pbf.finish());

      resolve({
        statusCode: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "attachment; filename=merged.osm.pbf"
        },
        body: buffer.toString("base64"),
        isBase64Encoded: true
      });
    });
  });
};
