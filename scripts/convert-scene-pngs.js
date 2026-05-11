const fs = require("fs");
const sharp = require("sharp");

async function main() {
  const start = Number(process.argv[2] || 1);
  const end = Number(process.argv[3] || start);

  for (let i = start; i <= end; i += 1) {
    const id = String(i).padStart(3, "0");
    const input = `assets/scenes/cs${id}.png`;
    const output = `assets/scenes/cs${id}.webp`;

    if (!fs.existsSync(input)) continue;
    await sharp(input).webp({ quality: 82 }).toFile(output);
    console.log(output);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
