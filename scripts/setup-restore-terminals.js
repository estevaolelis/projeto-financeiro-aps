const fs = require("fs");
const path = require("path");

const vscodeDir = path.join(__dirname, "..", ".vscode");
const source = process.platform === "win32" ? "restore-terminals.windows.json" : "restore-terminals.linux.json";
const destino = path.join(vscodeDir, "restore-terminals.json");

fs.copyFileSync(path.join(vscodeDir, source), destino);
console.log(`Copiado ${source} -> .vscode/restore-terminals.json`);
