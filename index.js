const http = require("http");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = http.createServer(async (req, res) => {
  const url = req.url;
  console.log(`Request URL: ${url}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (url === "/") {
    // Serve the main HTML file
    fs.readFile(path.join(__dirname, "public", "index.html"), "utf-8", (error, content) => {
      if (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`An error occurred: ${error.message}`);
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      }
    });
  } else if (url === "/api") {
    const { MongoClient} = require("mongodb");
    const uri = process.env.MONGODB_URI;
    
     async function main() {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        await fetchMovies(client);    
      } finally{
          await client.close();
      }
    }

   main().catch(console.error);

   async function fetchMovies(client) {
    const movies = await client.db("movie-suggestion-app").collection("movies").find({});
    const results = await movies.toArray();
    console.log(results);

    try {
      res.writeHead(200, { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache" 
    });
      res.write(JSON.stringify(results));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch movies" }));
    }
  } 
} else {
    // Serve static files like CSS and images
    const filePath = path.join(__dirname, "public", path.normalize(url).replace(/^(\.\.[/\\])+/, ""));
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("<h1>404 - Page Not Found</h1>");
        } else {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("<h1>500 - Internal Server Error</h1>");
        }
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    });
  }
});

const PORT = process.env.PORT || 5959;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
