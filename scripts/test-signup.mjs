import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

// Exercise the actual shipped handler without contacting Kit or adding subscribers.
const homepage = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const handler = homepage.match(/  \/\/ Kit subscription[\s\S]*?(?=<\/script>)/)?.[0];
assert.ok(handler);

function setup(fetchImpl, valid = true) {
  const elements = new Map();
  for (const id of ["signal-form", "signal-status", "signal-submit", "guide-download", "signal-email"]) {
    const attributes = new Map();
    elements.set(id, {
      value: " reader@example.com ", textContent: "", disabled: false, hidden: true,
      events: {}, attributes,
      addEventListener(type, listener) { this.events[type] = listener; },
      setAttribute(name, value) { attributes.set(name, value); },
      removeAttribute(name) { attributes.delete(name); },
      hasAttribute(name) { return attributes.has(name); },
      checkValidity() { return valid; },
      focus() { this.focused = true; },
      reset() { elements.get("signal-email").value = ""; },
    });
  }
  const requests = [];
  let timeout;
  let cleared = false;
  runInNewContext(handler, {
    document: { getElementById: (id) => elements.get(id) },
    FormData, AbortController,
    setTimeout(callback, delay) { assert.equal(delay, 15000); timeout = callback; return 1; },
    clearTimeout() { cleared = true; },
    fetch(url, options) { requests.push({ url, options }); return fetchImpl(url, options); },
  });
  return {
    elements, requests,
    submit() { elements.get("signal-form").events.submit({ preventDefault() {} }); },
    expire() { timeout(); },
    get cleared() { return cleared; },
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test("invalid email stays local, focuses the field, and clears its error on editing", () => {
  const state = setup(() => { throw new Error("Must not send invalid email"); }, false);
  state.submit();
  const input = state.elements.get("signal-email");
  assert.equal(state.requests.length, 0);
  assert.equal(input.attributes.get("aria-invalid"), "true");
  assert.equal(input.focused, true);
  assert.match(state.elements.get("signal-status").textContent, /valid email/);
  input.events.input();
  assert.equal(input.hasAttribute("aria-invalid"), false);
  assert.equal(state.elements.get("signal-status").textContent, "");
});

for (const payload of [{ status: "success" }, { subscription: { id: 1 } }]) {
  test(`confirmed signup reveals guide (${Object.keys(payload)[0]})`, async () => {
    const state = setup(async () => ({ ok: true, json: async () => payload }));
    state.submit();
    state.submit();
    assert.equal(state.requests.length, 1, "Block duplicate submissions while pending.");
    assert.equal(state.requests[0].options.body.get("email_address"), "reader@example.com");
    assert.equal(state.requests[0].url, "https://app.kit.com/forms/9676498/subscriptions");
    assert.equal(state.elements.get("signal-form").attributes.get("aria-busy"), "true");
    await settle();
    assert.equal(state.elements.get("guide-download").hidden, false);
    assert.equal(state.elements.get("signal-email").value, "");
    assert.match(state.elements.get("signal-status").textContent, /check your inbox to confirm/);
    assert.equal(state.elements.get("signal-submit").disabled, false);
    assert.equal(state.elements.get("signal-form").hasAttribute("aria-busy"), false);
    assert.equal(state.cleared, true);
  });
}

for (const [name, fetchImpl] of [
  ["HTTP rejection", async () => ({ ok: false, json: async () => ({ status: "success" }) })],
  ["application rejection", async () => ({ ok: true, json: async () => ({ status: "error" }) })],
  ["malformed response", async () => ({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } })],
  ["network failure", async () => { throw new TypeError("Failed to fetch"); }],
]) {
  test(`${name} preserves the address and permits retry`, async () => {
    const state = setup(fetchImpl);
    state.submit();
    await settle();
    assert.equal(state.elements.get("guide-download").hidden, true);
    assert.equal(state.elements.get("signal-email").value, "reader@example.com");
    assert.equal(state.elements.get("signal-submit").disabled, false);
    assert.equal(state.elements.get("signal-form").hasAttribute("aria-busy"), false);
    assert.match(state.elements.get("signal-status").textContent, /couldn’t confirm/);
    assert.equal(state.cleared, true);
    state.submit();
    await settle();
    assert.equal(state.requests.length, 2);
  });
}

test("timeout aborts a stalled request and allows a successful retry", async () => {
  let attempts = 0;
  const state = setup(async (_url, { signal }) => {
    if (++attempts > 1) return { ok: true, json: async () => ({ status: "success" }) };
    return new Promise((_resolve, reject) => signal.addEventListener("abort", () => {
      const error = new Error("Timed out");
      error.name = "AbortError";
      reject(error);
    }));
  });
  state.submit();
  state.expire();
  await settle();
  assert.equal(state.requests[0].options.signal.aborted, true);
  assert.match(state.elements.get("signal-status").textContent, /took too long/);
  assert.equal(state.elements.get("signal-submit").disabled, false);
  assert.equal(state.elements.get("guide-download").hidden, true);
  assert.equal(state.cleared, true);
  state.submit();
  await settle();
  assert.equal(state.elements.get("guide-download").hidden, false);
});
