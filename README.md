# Washington, D.C. National Parks — one-page site

A one-page guide to the National Park Service sites in Washington, D.C., built from three MCP servers:

| Server | Used for |
|---|---|
| [nps_mcp](https://github.com/amysatterlee/nps_mcp) (vendored in `servers/nps_mcp`) | `park-list`, `park-details` |
| [mcp-server-nationalparks](https://github.com/kyrietangsheng/mcp-server-nationalparks) | `findParks`, `getAlerts`, `getEvents`, `getVisitorCenters` |
| [datagov-mcp-server](https://github.com/melaodoidao/datagov-mcp-server) (patched copy in `servers/datagov`) | `package_search` |

The datagov copy is patched because catalog.data.gov retired its CKAN `/api/3` endpoint.

## How it works

`scripts/build-data.mjs` connects to each server as an MCP client and writes `site/data.json` and `site/data.js`. `site/index.html` renders that data; no API key reaches the browser.

## Run

```sh
npm install
(cd servers/nps_mcp && npm install && npm run build)
echo "NPS_API_KEY=your_key" > .env     # free key: https://www.nps.gov/subjects/developer/get-started.htm
npm run build:data                      # refresh the data
npm start                               # or just open site/index.html
```
