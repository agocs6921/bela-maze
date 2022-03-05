const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const { argv } = require("process");

(async () => {
    const OPTIONS = argv[2] === "dev" ? {
            bundle: true,
            minify: false,
            sourcemap: true,
            watch: true
        } : {
            bundle: true,
            minify: true,
            sourcemap: false,
            watch: false
        }
        
    try {
        await build({
            entryPoints: {
                "./public/js/bundle": "./src/app.ts",
                "./public/css/bundle": "./src/sass/styles.sass"
            },
            outdir: ".",
            plugins: [
                sassPlugin()
            ],
            platform: "browser",
            ...OPTIONS
        })
    } catch(err) {}
})()