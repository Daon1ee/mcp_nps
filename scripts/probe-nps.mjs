import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const env = { ...process.env, API_KEY: process.env.NPS_API_KEY };
const client = new Client({ name: "probe", version: "0.1.0" });
await client.connect(new StdioClientTransport({ command: "npx", args: ["-y", "mcp-server-nationalparks"], env }));
const r = await client.callTool({ name: "findParks", arguments: { stateCode: "DC", limit: 50 } });
console.log(r.content[0].text.slice(0, 3500));
await client.close();
