// Connects to the three MCP servers as a client and writes site/data.json.
//   nps_mcp                 -> park-list, park-details        (roster + featured park detail)
//   mcp-server-nationalparks -> findParks, getAlerts, getVisitorCenters, getEvents
//   datagov-mcp-server      -> package_search                 (open datasets about DC parks)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Minimal .env loader (keeps the key out of the shell history and the site)
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
if (!process.env.NPS_API_KEY) throw new Error("NPS_API_KEY missing in .env");
const env = { ...process.env, API_KEY: process.env.NPS_API_KEY };

const FEATURED = ["nama", "rocr", "whho", "this", "frdo", "keaq"];
const EVENT_CODES = ["nama", "rocr", "whho", "this"];
const DATASET_QUERIES = ["Washington DC national park", "National Mall and Memorial Parks", "Rock Creek Park"];

const RELEVANT = /washington,? d\.?c|district of columbia|national mall|rock creek|national capital|\bD\.?C\.? /i;

const calls = { nps_mcp: [], nationalparks: [], datagov: [] };

async function connect(label, command, args) {
  const client = new Client({ name: `dc-parks-build/${label}`, version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command, args, env, stderr: "ignore" }));
  const call = async (name, arguments_) => {
    const res = await client.callTool({ name, arguments: arguments_ });
    const text = res.content?.[0]?.text ?? "";
    if (res.isError) throw new Error(`${label}.${name}: ${text.slice(0, 200)}`);
    calls[label].push(name);
    return JSON.parse(text);
  };
  return { call, close: () => client.close() };
}

const day = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const inTwoMonths = new Date(today.getTime() + 60 * 864e5);

const nps = await connect("nps_mcp", "node", ["servers/nps_mcp/build/index.js"]);
const np = await connect("nationalparks", "npx", ["-y", "mcp-server-nationalparks"]);
const dg = await connect("datagov", "node", ["servers/datagov/index.js"]);

// 1. Roster — nationalparks.findParks (images, coordinates, hours) + nps_mcp.park-list (cross-check)
const roster = await np.call("findParks", { stateCode: "DC", limit: 100 });
const rosterCheck = await nps.call("park-list", { stateCode: "DC" });
const parks = roster.parks
  .map((p) => ({
    code: p.code,
    name: p.name,
    designation: p.designation,
    description: p.description,
    url: p.url,
    lat: parseFloat(p.location?.latitude),
    lng: parseFloat(p.location?.longitude),
    image: p.images?.[0] ? { url: p.images[0].url, alt: p.images[0].altText, credit: p.images[0].credit } : null,
    fees: (p.entranceFees ?? []).map((f) => ({ title: f.title, cost: f.cost })),
    hours: p.operatingHours?.[0]?.description ?? "",
    activities: (p.activities ?? []).slice(0, 6),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// 2. Featured park detail — nps_mcp.park-details
const featured = [];
for (const code of FEATURED) {
  const [d] = await nps.call("park-details", { parkCode: code });
  if (!d) continue;
  featured.push({
    code,
    name: d.fullName,
    designation: d.designation,
    description: d.description,
    directions: d.directionsInfo,
    weather: d.weatherInfo,
    url: d.url,
    lat: parseFloat(d.latitude),
    lng: parseFloat(d.longitude),
    address: d.addresses?.find((a) => a.type === "Physical") ?? d.addresses?.[0] ?? null,
    images: (d.images ?? []).slice(0, 4).map((i) => ({ url: i.url, alt: i.altText, caption: i.caption, credit: i.credit })),
    fees: (d.entranceFees ?? []).map((f) => ({ title: f.title, cost: f.cost, description: f.description })),
    hours: d.operatingHours?.[0]?.description ?? "",
    topics: (d.topics ?? []).slice(0, 5).map((t) => t.name),
  });
}

// 3. Live info — nationalparks.getAlerts / getEvents / getVisitorCenters
const alerts = [];
const visitorCenters = [];
for (const code of FEATURED) {
  const a = await np.call("getAlerts", { parkCode: code, limit: 5 });
  for (const x of a.alerts ?? [])
    alerts.push({ park: code, title: x.title, description: x.description, category: x.category, url: x.url });
  const v = await np.call("getVisitorCenters", { parkCode: code, limit: 5 });
  for (const x of v.visitorCenters ?? [])
    visitorCenters.push({ park: code, name: x.name, description: x.description, url: x.url, lat: parseFloat(x.latitude), lng: parseFloat(x.longitude) });
}

const events = [];
for (const code of EVENT_CODES) {
  const e = await np.call("getEvents", { parkCode: code, limit: 20, dateStart: day(today), dateEnd: day(inTwoMonths) });
  for (const x of e.events ?? []) {
    const dates = String(x.dateTime?.dates ?? "").split(",").map((d) => d.trim()).filter(Boolean).sort();
    events.push({
      park: code,
      title: x.title,
      description: (x.description ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(),
      category: x.category,
      dates,
      time: [...new Set(String(x.dateTime?.times ?? "").split(",").map((t) => t.trim()).filter(Boolean))].join(" · "),
      location: x.location,
      tags: (x.tags ?? []).slice(0, 3),
    });
  }
}
const todayStr = day(today);
for (const e of events) e.dates = e.dates.filter((d) => d >= todayStr);
events.splice(0, events.length, ...events.filter((e) => e.dates.length));
// Same day: special events first, then one-off/short-run programs before daily recurring listings
// (the API reports every event as "All day", so time can't be used to rank them)
const special = (e) => (e.category === "Special Event" ? 0 : 1);
events.sort((a, b) => a.dates[0].localeCompare(b.dates[0]) || special(a) - special(b) || a.dates.length - b.dates.length);

// 4. Open data — datagov.package_search
const seen = new Set();
const datasets = [];
for (const q of DATASET_QUERIES) {
  const r = await dg.call("package_search", { q, rows: 8 });
  for (const p of r.result.results) {
    if (seen.has(p.name) || !RELEVANT.test(`${p.title} ${p.notes}`)) continue;
    seen.add(p.name);
    datasets.push({
      title: p.title,
      summary: (p.notes ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&amp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
      publisher: p.organization?.title,
      url: p.url,
      tags: [...new Set(p.tags.map((t) => t.name))].slice(0, 4),
      formats: [...new Set(p.resources.map((r) => r.format).filter(Boolean))].slice(0, 4),
    });
  }
}

await Promise.all([nps.close(), np.close(), dg.close()]);

const summarize = (arr) => Object.entries(arr.reduce((m, n) => ((m[n] = (m[n] ?? 0) + 1), m), {})).map(([tool, count]) => ({ tool, count }));
const data = {
  generatedAt: new Date().toISOString(),
  rosterCrossCheck: { nps_mcp: rosterCheck.length, nationalparks: roster.parks.length },
  mcp: {
    nps_mcp: { repo: "https://github.com/amysatterlee/nps_mcp", calls: summarize(calls.nps_mcp) },
    nationalparks: { repo: "https://github.com/kyrietangsheng/mcp-server-nationalparks", calls: summarize(calls.nationalparks) },
    datagov: { repo: "https://github.com/melaodoidao/datagov-mcp-server", calls: summarize(calls.datagov) },
  },
  featured,
  parks,
  alerts,
  events,
  visitorCenters,
  datasets,
};

mkdirSync(new URL("../site/", import.meta.url), { recursive: true });
writeFileSync(new URL("../site/data.json", import.meta.url), JSON.stringify(data, null, 2));
// Same data as a script so index.html also works when opened straight from disk (file://)
writeFileSync(new URL("../site/data.js", import.meta.url), `window.DC_DATA = ${JSON.stringify(data)};\n`);
console.log(
  `data.json: ${parks.length} parks, ${featured.length} featured, ${alerts.length} alerts, ${events.length} events, ${visitorCenters.length} visitor centers, ${datasets.length} datasets`
);
console.log("MCP calls:", JSON.stringify(data.mcp, (k, v) => (k === "repo" ? undefined : v)));
