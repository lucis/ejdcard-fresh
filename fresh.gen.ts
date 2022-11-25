// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/api/joke.ts";
import * as $1 from "./routes/cards/admin.tsx";
import * as $2 from "./routes/cards/index.tsx";
import * as $3 from "./routes/cards/new.tsx";
import * as $4 from "./routes/cards/operation/confirm.tsx";
import * as $5 from "./routes/cards/operation/index.tsx";
import * as $6 from "./routes/index.tsx";
import * as $7 from "./routes/login/index.tsx";
import * as $8 from "./routes/login/success.tsx";
import * as $$0 from "./islands/Counter.tsx";
import * as $$1 from "./islands/LoginListener.tsx";
import * as $$2 from "./islands/RealInput.tsx";

const manifest = {
  routes: {
    "./routes/api/joke.ts": $0,
    "./routes/cards/admin.tsx": $1,
    "./routes/cards/index.tsx": $2,
    "./routes/cards/new.tsx": $3,
    "./routes/cards/operation/confirm.tsx": $4,
    "./routes/cards/operation/index.tsx": $5,
    "./routes/index.tsx": $6,
    "./routes/login/index.tsx": $7,
    "./routes/login/success.tsx": $8,
  },
  islands: {
    "./islands/Counter.tsx": $$0,
    "./islands/LoginListener.tsx": $$1,
    "./islands/RealInput.tsx": $$2,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
