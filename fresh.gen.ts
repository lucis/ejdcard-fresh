// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/[name].tsx";
import * as $1 from "./routes/api/joke.ts";
import * as $2 from "./routes/cards/new.tsx";
import * as $3 from "./routes/index.tsx";
import * as $4 from "./routes/login.tsx";
import * as $5 from "./routes/login/index.tsx";
import * as $6 from "./routes/login/success.tsx";
import * as $7 from "./routes/private/index.tsx";
import * as $$0 from "./islands/Counter.tsx";
import * as $$1 from "./islands/LoginButtons.tsx";
import * as $$2 from "./islands/LoginListener.tsx";

const manifest = {
  routes: {
    "./routes/[name].tsx": $0,
    "./routes/api/joke.ts": $1,
    "./routes/cards/new.tsx": $2,
    "./routes/index.tsx": $3,
    "./routes/login.tsx": $4,
    "./routes/login/index.tsx": $5,
    "./routes/login/success.tsx": $6,
    "./routes/private/index.tsx": $7,
  },
  islands: {
    "./islands/Counter.tsx": $$0,
    "./islands/LoginButtons.tsx": $$1,
    "./islands/LoginListener.tsx": $$2,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
