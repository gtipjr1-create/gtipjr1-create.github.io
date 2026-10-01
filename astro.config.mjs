import { cp, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const passthroughPaths = [
  "CNAME",
  "favicon.svg",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "assets",
  "selftrainer-history.jpeg",
  "selftrainer-home.jpeg",
  "selftrainer-onboarding.jpeg",
  "selftrainer-session.jpeg",
  "projects/selftrainer/index.html",
  "projects/fitpulse/index.html",
];

const preserveExistingStaticSite = {
  name: "preserve-existing-static-site",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const outputRoot = fileURLToPath(dir);

      for (const relativePath of passthroughPaths) {
        const source = join(projectRoot, relativePath);
        const destination = join(outputRoot, relativePath);
        const sourceStats = await stat(source);

        await mkdir(dirname(destination), { recursive: true });
        await cp(source, destination, {
          force: true,
          recursive: sourceStats.isDirectory(),
        });
      }
    },
  },
};

export default defineConfig({
  site: "https://garrytipler.com",
  output: "static",
  trailingSlash: "always",
  integrations: [preserveExistingStaticSite],
});

