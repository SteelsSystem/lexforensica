import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chatRouter } from "./src/routes/api/chat";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json({ limit: "2mb" }));
app.use("/api/chat", chatRouter);

const dist = path.join(__dirname, "dist");
app.use(express.static(dist));
app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));

app.listen(port, () => console.log(`Lex Forensica server listening on ${port}`));
