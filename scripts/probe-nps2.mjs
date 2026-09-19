import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const env = { ...process.env, API_KEY: process.env.NPS_API_KEY };
const a = new Client({ name: "probe", version: "0.1.0" });
await a.connect(new StdioClientTransport({ command: "node", args: ["servers/nps_mcp/build/index.js"], env }));
console.log("nps_mcp tools:", (await a.listTools()).tools.map(t => t.name));
const list = await a.callTool({ name: "park-list", arguments: { stateCode: "DC" } });
console.log("park-list:", list.content[0].text.slice(0, 400));
const det = await a.callTool({ name: "park-details", arguments: { parkCode: "nama" } });
console.log("park-details:", det.content[0].text.slice(0, 700));
await a.close();
const b = new Client({ name: "probe", version: "0.1.0" });
await b.connect(new StdioClientTransport({ command: "npx", args: ["-y", "mcp-server-nationalparks"], env }));
const fp = JSON.parse((await b.callTool({ name: "findParks", arguments: { stateCode: "DC", limit: 50 } })).content[0].text);
console.log(fp.parks.map(p => `${p.code}:${p.name}`).join("\n"));
for (const t of ["getAlerts", "getVisitorCenters", "getEvents"]) {
  const r = await b.callTool({ name: t, arguments: { parkCode: "nama", limit: 2 } });
  console.log(t, "->", r.content[0].text.slice(0, 350).replace(/\s+/g, " "));
}
await b.close();
