import assert from "node:assert/strict";
import { localBase, parsePybotReply, pickDefaultModel, safePath, scrubSecret, upstreamUrl } from "../src/lib/ai-providers";

const prose = parsePybotReply("Abre práctica cuando quieras.");
assert.equal(prose.say, "Abre práctica cuando quieras.");
assert.deepEqual(prose.actions, []);

const fenced = parsePybotReply('```json\n{"say":"Voy al mapa","actions":[{"tool":"navigate","path":"/learn"},{"tool":"navigate","path":"https://evil.test"},{"tool":"set_course","courseId":"agentes-ia"},{"tool":"set_sound","on":false}]}\n```');
assert.equal(fenced.say, "Voy al mapa");
assert.deepEqual(fenced.actions, [
  { tool: "navigate", path: "/learn" },
  { tool: "set_course", courseId: "agentes-ia" },
  { tool: "set_sound", on: false },
]);

assert.equal(safePath("/lesson/u1-l1"), "/lesson/u1-l1");
assert.equal(safePath("/lesson/no-existe"), null);
assert.equal(safePath("/../profile"), null);

assert.equal(upstreamUrl("openai", "http://169.254.169.254/", "chat").href, "https://api.openai.com/v1/chat/completions");
assert.equal(upstreamUrl("deepseek", "", "models").href, "https://api.deepseek.com/models");
assert.equal(localBase("http://127.0.0.1:1234/v1"), "http://127.0.0.1:1234/v1");
assert.throws(() => localBase("http://169.254.169.254/latest"), /localhost/);
assert.equal(pickDefaultModel("deepseek", ["deepseek-reasoner", "deepseek-chat"]), "deepseek-chat");
assert.equal(scrubSecret("invalid key sk-test", "sk-test"), "invalid key ***");

console.log("Pybot AI routing checks passed.");
