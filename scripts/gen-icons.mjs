import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const buildDir = join(root, 'build')
const svgPath = join(buildDir, 'icon.svg')
const svgBuffer = readFileSync(svgPath)

mkdirSync(buildDir, { recursive: true })

// PNG 여러 크기 생성
const sizes = [16, 32, 48, 64, 128, 256, 512]
const pngBuffers = {}

for (const size of sizes) {
  const buf = await sharp(svgBuffer).resize(size, size).png().toBuffer()
  pngBuffers[size] = buf
  writeFileSync(join(buildDir, `icon-${size}.png`), buf)
  console.log(`  ✓ icon-${size}.png`)
}

// icon.png (512px — Linux / electron-builder 기본)
writeFileSync(join(buildDir, 'icon.png'), pngBuffers[512])
console.log('  ✓ icon.png (512px)')

// icon.ico (Windows) — 16, 32, 48, 256 포함
const icoBuffer = await pngToIco([
  pngBuffers[16],
  pngBuffers[32],
  pngBuffers[48],
  pngBuffers[256],
])
writeFileSync(join(buildDir, 'icon.ico'), icoBuffer)
console.log('  ✓ icon.ico')

console.log('\n아이콘 생성 완료!')
