'use client'

// Loader global de next/image.
// - Cloudinary: redimensiona y elige formato (WebP/AVIF) en su CDN, sin consumir
//   el cupo de optimización de imágenes de Vercel (limitado en el plan Hobby).
// - Imágenes locales de /public: ya están en WebP a tamaño razonable, se sirven tal cual.
// - Otros orígenes (p. ej. Firebase Storage): se sirven tal cual.
// Para Cloudinary se usa siempre q_auto (calidad elegida por Cloudinary según la imagen),
// por eso se ignora el `quality` que pasa next/image.
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  const marker = '/image/upload/'
  if (src.includes('res.cloudinary.com') && src.includes(marker)) {
    const transform = `f_auto,q_auto,c_limit,w_${width}`
    return src.replace(marker, `${marker}${transform}/`)
  }

  if (src.startsWith('/')) return `${src}?w=${width}`
  return src
}
