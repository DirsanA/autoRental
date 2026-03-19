import main from "./app.js";
import { ENV } from "./config/env.js";

const app = main();
const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
