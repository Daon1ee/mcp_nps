import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "probe", version: "0.1.0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["servers/datagov/index.js"] }));
console.log("tools:", (await client.listTools()).tools.map(t => t.name));
const res = await client.callTool({
  name: "package_search",
  arguments: { q: "Washington DC parks", rows: 3 },
});
console.log(res.content[0].text.slice(0, 2500));
await client.close();
