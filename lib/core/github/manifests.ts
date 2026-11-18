import type { ParsedManifest } from "./types";

/*
 * Reads a concrete tech stack from dependency manifests, so the model is told
 * what a project depends on instead of guessing from file extensions.
 * Ported from gitms (core/analyze/manifests.ts; MIT, © 2026 gitms
 * contributors).
 */

export const MANIFEST_FILES = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "setup.py",
  "go.mod",
  "Cargo.toml",
  "composer.json",
  "pom.xml",
  "Gemfile",
  "pubspec.yaml",
] as const;

const MAX_DEPS = 40;

function trim(list: (string | undefined)[]): string[] {
  return [
    ...new Set(list.filter((item): item is string => Boolean(item))),
  ].slice(0, MAX_DEPS);
}

export function parseManifest(
  file: string,
  text: string,
): ParsedManifest | null {
  try {
    switch (file) {
      case "package.json":
        return parsePackageJson(text);
      case "composer.json":
        return parseComposerJson(text);
      case "pyproject.toml":
        return parsePyproject(text);
      case "requirements.txt":
        return parseRequirements(text);
      case "setup.py":
        return parseSetupPy(text);
      case "go.mod":
        return parseGoMod(text);
      case "Cargo.toml":
        return parseCargoToml(text);
      case "pom.xml":
        return parsePom(text);
      case "Gemfile":
        return parseGemfile(text);
      case "pubspec.yaml":
        return parsePubspec(text);
      default:
        return null;
    }
  } catch {
    // A malformed manifest is not worth failing a scan over.
    return null;
  }
}

function withOptional(
  manifest: ParsedManifest,
  extra: Partial<ParsedManifest>,
): ParsedManifest {
  // Only fields the manifest actually declares, so no empty keys appear.
  return Object.assign(
    manifest,
    Object.fromEntries(Object.entries(extra).filter(([, value]) => value)),
  );
}

function parsePackageJson(text: string): ParsedManifest {
  const pkg = JSON.parse(text) as {
    name?: string;
    version?: string;
    description?: string;
    main?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  };
  return withOptional(
    {
      file: "package.json",
      ecosystem: "npm",
      dependencies: trim([
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
      ]),
    },
    {
      packageName: pkg.name,
      version: pkg.version,
      description: pkg.description,
      entry: pkg.main,
      scripts: pkg.scripts,
    },
  );
}

function parseComposerJson(text: string): ParsedManifest {
  const pkg = JSON.parse(text) as {
    name?: string;
    description?: string;
    require?: Record<string, string>;
    scripts?: Record<string, string>;
  };
  return withOptional(
    {
      file: "composer.json",
      ecosystem: "composer",
      dependencies: trim(Object.keys(pkg.require ?? {})),
    },
    {
      packageName: pkg.name,
      description: pkg.description,
      scripts: pkg.scripts,
    },
  );
}

/** Minimal TOML reading: enough for names and dependency keys. */
function parsePyproject(text: string): ParsedManifest {
  const deps: string[] = [];
  // [project] dependencies = ["fastapi>=0.1", ...]
  const arrayBlock = /dependencies\s*=\s*\[([\s\S]*?)\]/m.exec(text)?.[1];
  if (arrayBlock) {
    for (const m of arrayBlock.matchAll(/["']([A-Za-z0-9._-]+)/g)) {
      deps.push(m[1] ?? "");
    }
  }
  // [tool.poetry.dependencies] name = "^1.0"
  const poetry = /\[tool\.poetry\.dependencies\]\r?\n([\s\S]*?)(?=\n\[|$)/.exec(
    text,
  )?.[1];
  if (poetry) {
    for (const m of poetry.matchAll(/^\s*([A-Za-z0-9._-]+)\s*=/gm)) {
      deps.push(m[1] ?? "");
    }
  }
  return withOptional(
    {
      file: "pyproject.toml",
      ecosystem: "python",
      dependencies: trim(deps.filter((d) => d.toLowerCase() !== "python")),
    },
    {
      packageName: /^\s*name\s*=\s*["']([^"']+)["']/m.exec(text)?.[1],
      version: /^\s*version\s*=\s*["']([^"']+)["']/m.exec(text)?.[1],
      description: /^\s*description\s*=\s*["']([^"']+)["']/m.exec(text)?.[1],
    },
  );
}

function parseRequirements(text: string): ParsedManifest {
  const deps = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"))
    .map((line) => line.split(/[<>=!~[; ]/)[0]);
  return {
    file: "requirements.txt",
    ecosystem: "python",
    dependencies: trim(deps),
  };
}

function parseSetupPy(text: string): ParsedManifest {
  const block = /install_requires\s*=\s*\[([\s\S]*?)\]/.exec(text)?.[1] ?? "";
  return withOptional(
    {
      file: "setup.py",
      ecosystem: "python",
      dependencies: trim(
        [...block.matchAll(/["']([A-Za-z0-9._-]+)/g)].map((m) => m[1]),
      ),
    },
    { packageName: /name\s*=\s*["']([^"']+)["']/.exec(text)?.[1] },
  );
}

function parseGoMod(text: string): ParsedManifest {
  const version = /^go\s+(\S+)/m.exec(text)?.[1];
  return withOptional(
    {
      file: "go.mod",
      ecosystem: "go",
      dependencies: trim(
        [...text.matchAll(/^\s+([\w.\-/]+)\s+v[\d.]+/gm)].map((m) => m[1]),
      ),
    },
    {
      packageName: /^module\s+(\S+)/m.exec(text)?.[1],
      version: version ? `go ${version}` : undefined,
    },
  );
}

function parseCargoToml(text: string): ParsedManifest {
  const block =
    /\[dependencies\]\r?\n([\s\S]*?)(?=\n\[|$)/.exec(text)?.[1] ?? "";
  return withOptional(
    {
      file: "Cargo.toml",
      ecosystem: "rust",
      dependencies: trim(
        [...block.matchAll(/^\s*([A-Za-z0-9._-]+)\s*=/gm)].map((m) => m[1]),
      ),
    },
    {
      packageName: /^\s*name\s*=\s*["']([^"']+)["']/m.exec(text)?.[1],
      version: /^\s*version\s*=\s*["']([^"']+)["']/m.exec(text)?.[1],
      description: /^\s*description\s*=\s*["']([^"']+)["']/m.exec(text)?.[1],
    },
  );
}

function parsePom(text: string): ParsedManifest {
  return withOptional(
    {
      file: "pom.xml",
      ecosystem: "maven",
      dependencies: trim(
        [
          ...text.matchAll(
            /<dependency>[\s\S]*?<artifactId>([^<]+)<\/artifactId>/g,
          ),
        ].map((m) => m[1]),
      ),
    },
    {
      packageName: /<artifactId>([^<]+)<\/artifactId>/.exec(text)?.[1],
      description: /<description>([^<]+)<\/description>/.exec(text)?.[1],
    },
  );
}

function parseGemfile(text: string): ParsedManifest {
  return {
    file: "Gemfile",
    ecosystem: "ruby",
    dependencies: trim(
      [...text.matchAll(/^\s*gem\s+["']([^"']+)["']/gm)].map((m) => m[1]),
    ),
  };
}

function parsePubspec(text: string): ParsedManifest {
  const block = /^dependencies:\s*$([\s\S]*?)(^\S|$)/m.exec(text)?.[1] ?? "";
  return withOptional(
    {
      file: "pubspec.yaml",
      ecosystem: "dart",
      dependencies: trim(
        [...block.matchAll(/^\s{2}([A-Za-z0-9._]+):/gm)].map((m) => m[1]),
      ),
    },
    {
      packageName: /^name:\s*(\S+)/m.exec(text)?.[1],
      description: /^description:\s*(.+)$/m.exec(text)?.[1]?.trim(),
    },
  );
}
