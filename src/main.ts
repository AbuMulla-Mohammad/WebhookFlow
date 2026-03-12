import { createContainer } from "./presentation/composition-root/container.js";
import { createApp } from "./presentation/http/app.js";

const container = createContainer();
const app = createApp(container);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`WebhookFlow listening on http://localhost:${port}`);
});
