import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import fs from "fs";
import path from "path";
import license from "rollup-plugin-license";
import css from "rollup-plugin-css-only";

export default {
  input: "./src/index.js",
  output: [
    // UMD Build
    {
      file: "dist/js/mobject-graph-ui-vision-pack.bundle.js",
      format: "umd",
      name: "MobjectGraphUiVisionPack",
      globals: {
        "mobject-graph-ui": "MobjectGraphUi",
      },
    },
    // Minified UMD Build
    {
      file: "dist/js/mobject-graph-ui-vision-pack.bundle.min.js",
      format: "umd",
      name: "MobjectGraphUiVisionPack",
      globals: {
        "mobject-graph-ui": "MobjectGraphUi",
      },
      plugins: [terser()],
    },
    // ESM Build
    {
      file: "dist/js/mobject-graph-ui-vision-pack.bundle.esm.js",
      format: "esm",
    },
    // Minified ESM Build
    {
      file: "dist/js/mobject-graph-ui-vision-pack.bundle.esm.min.js",
      format: "esm",
      plugins: [terser()],
    },
    // CommonJS Build
    {
      file: "dist/js/mobject-graph-ui-vision-pack.bundle.cjs.js",
      format: "cjs",
    },
    // Minified CommonJS Build
    {
      file: "dist/js/mobject-graph-ui-vision-pack.bundle.cjs.min.js",
      format: "cjs",
      plugins: [terser()],
    },
  ],
  external: ["mobject-graph-ui"],
  plugins: [
    nodeResolve(),
    css({
      output: "mobject-graph-ui-vision-pack.css",
    }),
    addLicenseToCssFiles({ filename: "LICENSE" }),
    license({
      sourcemap: true,
      cwd: process.cwd(),

      banner: {
        commentStyle: "regular",

        content: () => {
          return makeLicenseContent();
        },
      },
      thirdParty: {
        allow: {
          test: "MIT",
          failOnUnlicensed: true,
          failOnViolation: true,
        },
      },
    }),
    finallyMoveFile({
      src: "dist/js/mobject-graph-ui-vision-pack.css",
      dest: "dist/css/mobject-graph-ui-vision-pack.css",
    }),
  ],
};

function makeLicenseContent() {
  const licenseFile = path.join(__dirname, "LICENSE");
  let licenseContent = fs.readFileSync(licenseFile, "utf-8");
  const thirdPartyLicenseFile = path.join(__dirname, "THIRD-PARTY-LICENSES");
  if (fs.existsSync(thirdPartyLicenseFile)) {
    licenseContent += "\nThird Party Licenses";
    licenseContent += "\n--------------------";
    licenseContent += "\n";
    licenseContent += "\n" + fs.readFileSync(thirdPartyLicenseFile, "utf-8");
  }
  return licenseContent;
}

function addLicenseToCssFiles({ filename }) {
  return {
    name: "css-license-banner",
    generateBundle(outputOptions, bundle) {
      const licenseFile = path.join(__dirname, filename);
      let licenseContent = fs.readFileSync(licenseFile, "utf-8");
      const banner = `/*\n${licenseContent}\n*/\n`;

      for (const bundleFileName of Object.keys(bundle)) {
        if (bundleFileName.endsWith(".css")) {
          bundle[bundleFileName].source =
            banner + bundle[bundleFileName].source;
        }
      }
    },
  };
}

function finallyMoveFile(options) {
  return {
    name: "copy-then-delete",
    closeBundle() {
      const destDir = path.dirname(options.dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(options.src, options.dest);
      fs.unlinkSync(options.src);
    },
  };
}
