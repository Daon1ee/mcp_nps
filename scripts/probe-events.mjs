import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const c = new Client({ name: "p", version: "1" });
await c.connect(new StdioClientTransport({ command: "npx", args: ["-y", "mcp-server-nationalparks"], env: process.env, stderr: "ignore" }));
const r = JSON.parse((await c.callTool({ name: "getEvents", arguments: { parkCode: "rocr", limit: 2, dateStart: "2026-09-19", dateEnd: "2026-11-19" } })).content[0].text);
console.log(JSON.stringify(r.events[0], null, 1).slice(0, 1800));
await c.close();
