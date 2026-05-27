import { readFileSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

/**
 * @param {string} toolkitRoot Absolute path to packages/toolkit
 */
export function loadRegistry(toolkitRoot) {
  const registryPath = join(toolkitRoot, "skills/_registry.yml");
  if (!existsSync(registryPath)) {
    throw new Error(`Registry not found at ${registryPath}`);
  }
  const doc = yaml.load(readFileSync(registryPath, "utf8"));
  if (!doc?.skills?.length) {
    throw new Error("Invalid registry: missing skills array");
  }
  return doc;
}
