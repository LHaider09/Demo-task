import { buildApp } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

buildApp().listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
