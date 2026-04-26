#!/usr/bin/env node
// Push the AkinAI repo to GitHub via the GitHub REST API.
// Requires env: GITHUB_PERSONAL_ACCESS_TOKEN (or GITHUB_TOKEN) and GITHUB_USERNAME.
// Usage: node scripts/push-via-api.mjs

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const TOKEN =
  process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const OWNER = "expoxtechinc";
const REPO = "Akin-AI";
const BRANCH = "main";
const COMMIT_MESSAGE = "AkinAI release — initial push from Replit";
const ROOT = process.cwd();
const API = "https://api.github.com";

if (!TOKEN || !USERNAME) {
  console.error("ERROR: GITHUB_PERSONAL_ACCESS_TOKEN and GITHUB_USERNAME must be set.");
  process.exit(1);
}

async function gh(method, urlPath, body) {
  const res = await fetch(`${API}${urlPath}`, {
    method,
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "akin-ai-deploy",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(
      `${method} ${urlPath} -> ${res.status}: ${text.slice(0, 400)}`,
    );
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

console.log("== Step 1: verify token ==");
const me = await gh("GET", "/user");
console.log(`Authenticated as: ${me.login}`);

console.log("\n== Step 2: ensure repo exists ==");
let repoMeta;
try {
  repoMeta = await gh("GET", `/repos/${OWNER}/${REPO}`);
  console.log(
    `Repo: ${repoMeta.full_name} (default_branch=${repoMeta.default_branch}, size=${repoMeta.size}KB)`,
  );
} catch (e) {
  if (e.status !== 404) throw e;
  console.log(`Repo not found, creating...`);
  try {
    repoMeta = await gh("POST", `/orgs/${OWNER}/repos`, {
      name: REPO,
      private: false,
      description:
        "AkinAI — Gemini-powered mobile assistant by Akin S. Sokpah (Liberia)",
      auto_init: false,
    });
    console.log(`Created in org: ${repoMeta.full_name}`);
  } catch (orgErr) {
    if (me.login.toLowerCase() === OWNER.toLowerCase()) {
      repoMeta = await gh("POST", `/user/repos`, {
        name: REPO,
        private: false,
        description:
          "AkinAI — Gemini-powered mobile assistant by Akin S. Sokpah (Liberia)",
        auto_init: false,
      });
      console.log(`Created under user: ${repoMeta.full_name}`);
    } else {
      throw new Error(
        `Cannot create repo. Org error: ${orgErr.message}\nAuthenticated user (${me.login}) is not ${OWNER}.\nEither create the repo manually at https://github.com/new or use a token from a user with access to ${OWNER}.`,
      );
    }
  }
}

console.log("\n== Step 3: list files (git ls-files) ==");
const files = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
console.log(`Found ${files.length} tracked files`);

console.log("\n== Step 4: detect existing main branch ==");
let parentSha = null;
try {
  const ref = await gh(
    "GET",
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
  );
  parentSha = ref.object.sha;
  console.log(`Existing ${BRANCH} at ${parentSha.slice(0, 8)}`);
} catch (e) {
  if (e.status !== 404 && e.status !== 409) throw e;
  console.log(`No existing ${BRANCH} — seeding repo with first commit`);
  // GitHub's git/blobs API won't work on a totally empty repo (409 "Git Repository is empty").
  // The Contents API does — use it to create one tiny file so the repo has a first commit + main branch.
  const seedContent = Buffer.from(
    "# AkinAI\n\nMobile assistant powered by Google Gemini, built by Akin S. Sokpah (Liberia).\n",
  ).toString("base64");
  const seedRes = await gh(
    "PUT",
    `/repos/${OWNER}/${REPO}/contents/.akinai-seed`,
    {
      message: "chore: initialize repo",
      content: seedContent,
      branch: BRANCH,
    },
  );
  parentSha = seedRes.commit.sha;
  console.log(`Seeded ${BRANCH} at ${parentSha.slice(0, 8)}`);
}

console.log("\n== Step 5: upload blobs ==");
const treeEntries = [];
let i = 0;
const concurrency = 6;
async function uploadOne(file) {
  const full = path.join(ROOT, file);
  let stat;
  try {
    stat = await fs.lstat(full);
  } catch {
    return null;
  }
  if (stat.isSymbolicLink()) {
    const target = await fs.readlink(full);
    const blob = await gh("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: target,
      encoding: "utf-8",
    });
    return { path: file, mode: "120000", type: "blob", sha: blob.sha };
  }
  if (!stat.isFile()) return null;
  const buf = await fs.readFile(full);
  const blob = await gh("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
    content: buf.toString("base64"),
    encoding: "base64",
  });
  const mode = stat.mode & 0o111 ? "100755" : "100644";
  return { path: file, mode, type: "blob", sha: blob.sha };
}

const queue = [...files];
async function worker() {
  while (queue.length) {
    const file = queue.shift();
    const entry = await uploadOne(file);
    if (entry) {
      treeEntries.push(entry);
      i++;
      if (i % 20 === 0 || i === files.length) {
        console.log(`  uploaded ${i}/${files.length}`);
      }
    }
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`Uploaded ${treeEntries.length} blobs`);

console.log("\n== Step 6: create tree ==");
// GitHub allows up to 7MB per tree request; chunk if needed.
let treeSha;
const CHUNK = 100;
if (treeEntries.length <= CHUNK) {
  const tree = await gh("POST", `/repos/${OWNER}/${REPO}/git/trees`, {
    tree: treeEntries,
  });
  treeSha = tree.sha;
} else {
  let baseTree = null;
  for (let s = 0; s < treeEntries.length; s += CHUNK) {
    const slice = treeEntries.slice(s, s + CHUNK);
    const body = baseTree ? { tree: slice, base_tree: baseTree } : { tree: slice };
    const tree = await gh("POST", `/repos/${OWNER}/${REPO}/git/trees`, body);
    baseTree = tree.sha;
    console.log(`  tree chunk ${Math.min(s + CHUNK, treeEntries.length)}/${treeEntries.length}`);
  }
  treeSha = baseTree;
}
console.log(`Tree: ${treeSha}`);

console.log("\n== Step 7: create commit ==");
const commitBody = {
  message: COMMIT_MESSAGE,
  tree: treeSha,
  parents: parentSha ? [parentSha] : [],
};
const commit = await gh(
  "POST",
  `/repos/${OWNER}/${REPO}/git/commits`,
  commitBody,
);
console.log(`Commit: ${commit.sha}`);

console.log("\n== Step 8: update branch ==");
if (parentSha) {
  await gh("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: commit.sha,
    force: true,
  });
  console.log(`Updated ${BRANCH} -> ${commit.sha.slice(0, 8)}`);
} else {
  await gh("POST", `/repos/${OWNER}/${REPO}/git/refs`, {
    ref: `refs/heads/${BRANCH}`,
    sha: commit.sha,
  });
  console.log(`Created ${BRANCH} -> ${commit.sha.slice(0, 8)}`);
}

console.log("\n=========================================");
console.log(`SUCCESS: https://github.com/${OWNER}/${REPO}`);
console.log(`Commit:  https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`);
console.log("=========================================");
