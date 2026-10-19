/**
 * Descarrega para `public/fotos` as imagens usadas no portfólio.
 * Uso:  pnpm photos
 *
 * As fotografias pertencem aos respetivos meios/fotógrafos (BANTUMEN
 * ©FeliciaAntonio/DR, Chocolate, Portal de TI, Forbes África Lusófona).
 * Para publicação, obtenha autorização ou substitua por fotos próprias
 * (basta manter os mesmos nomes de ficheiro).
 */
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "fotos")

const files = [
  // Fotos que acompanham o scroll
  ["pti-blazer-vermelho.avif", "https://pti.ao/umdois/2025/09/Jaqueline-Ngulo-nomeada-directora-da-Women-in-Tech-Angola.avif"],
  ["bantumen-exterior-1.jpg", "https://img.bndlyr.com/smdzvtzq6aukhdtc/_assets/img_5565.jpg?fit=fill&w=1200"],
  ["bantumen-exterior-2.jpg", "https://img.bndlyr.com/smdzvtzq6aukhdtc/_assets/whatsapp-image-2025-09-16-at-193715.jpeg?fit=fill&w=1200"],
  ["chocolate-premio-1.png", "https://chocolate.co.ao/wp-content/uploads/2026/04/image-277-768x1024.png"],
  ["chocolate-premio-2.png", "https://chocolate.co.ao/wp-content/uploads/2026/04/image-278-768x1024.png"],
  // Capas dos artigos
  ["artigos/forbes.jpg", "https://forbesafricalusofona.com/wp-content/uploads/women-in-tech.jpg"],
  ["artigos/chocolate.png", "https://chocolate.co.ao/wp-content/uploads/2026/04/1-7-2.png"],
  ["artigos/bantumen.png", "https://img.bndlyr.com/smdzvtzq6aukhdtc/_assets/jaqueline-ngulo.png?fit=fill&w=1200"],
  ["artigos/pti.avif", "https://pti.ao/umdois/2025/09/Jaqueline-Ngulo-nomeada-directora-da-Women-in-Tech-Angola.avif"],
]

let failed = 0
for (const [name, url] of files) {
  const target = join(root, name)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, Buffer.from(await res.arrayBuffer()))
    console.log(`✔ ${name}`)
  } catch (error) {
    failed++
    console.error(`✘ ${name} — ${error.message}`)
  }
}
console.log(failed ? `\n${failed} ficheiro(s) falharam.` : "\nTodas as imagens descarregadas.")
process.exitCode = failed ? 1 : 0
