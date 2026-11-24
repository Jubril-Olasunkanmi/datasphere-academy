import { formatNaira, type Course } from '../data'

const WIDTH = 1080
const HEIGHT = 1080
const NAVY = '#193d62'
const DEEP_NAVY = '#0a1c43'
const CYAN = '#0a9bb2'
const MUTED = '#6e8795'

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.closePath()
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 2) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  const visibleLines = lines.slice(0, maxLines)
  visibleLines.forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight))
  return visibleLines
}

async function loadBitmap(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load share image asset: ${url}`)
  return createImageBitmap(await response.blob())
}

async function prepareLogo(logo: ImageBitmap) {
  const canvas = document.createElement('canvas')
  canvas.width = logo.width
  canvas.height = logo.height
  const context = canvas.getContext('2d')!
  context.drawImage(logo, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < pixels.data.length; index += 4) {
    if (pixels.data[index] > 244 && pixels.data[index + 1] > 244 && pixels.data[index + 2] > 244) pixels.data[index + 3] = 0
  }
  context.putImageData(pixels, 0, 0)
  return canvas
}

export async function createCourseShareCard(course: Course, courseUrl: string) {
  if (document.fonts?.ready) await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')!
  const [image, sourceLogo] = await Promise.all([loadBitmap(course.image), loadBitmap('/brand/datasphere-academy-logo.jpg')])
  const logo = await prepareLogo(sourceLogo)

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.drawImage(logo, 42, 38, 310, 105)

  const longTitle = course.title === 'AI Automation & Agent Development'
  const titleSize = longTitle ? 48 : 72
  const titleLineHeight = longTitle ? 56 : 76
  context.fillStyle = DEEP_NAVY
  context.font = `700 ${titleSize}px Manrope, Arial, sans-serif`
  const titleLines = longTitle ? ['AI Automation', '& Agent Development'] : drawWrappedText(context, course.title, 42, 270, 420, titleLineHeight)
  if (longTitle) titleLines.forEach((line, index) => context.fillText(line, 42, 270 + index * titleLineHeight))
  const titleBottom = 270 + (titleLines.length - 1) * titleLineHeight

  context.fillStyle = CYAN
  context.fillRect(42, titleBottom + 40, 82, 7)
  context.fillStyle = NAVY
  context.font = '400 31px Manrope, Arial, sans-serif'
  const descriptionLines = drawWrappedText(context, course.short, 42, titleBottom + 105, 450, 40)

  roundedRect(context, 510, 180, 525, 365, 38)
  context.save()
  context.clip()
  const imageScale = Math.max(525 / image.width, 365 / image.height)
  const imageWidth = image.width * imageScale
  const imageHeight = image.height * imageScale
  context.drawImage(image, 510 + (525 - imageWidth) / 2, 180 + (365 - imageHeight) / 2, imageWidth, imageHeight)
  context.restore()

  const dividerY = Math.max(575, titleBottom + 105 + descriptionLines.length * 40 + 52)
  context.strokeStyle = '#9bd9e6'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(42, dividerY)
  context.lineTo(1038, dividerY)
  context.stroke()

  const statY = dividerY + 40
  const stat = (x: number, label: string, value: string) => {
    context.fillStyle = MUTED
    context.font = '400 16px Manrope, Arial, sans-serif'
    context.fillText(label, x, statY)
    context.fillStyle = DEEP_NAVY
    context.font = '700 24px Manrope, Arial, sans-serif'
    context.fillText(value, x, statY + 32)
  }
  stat(92, 'Level', course.level)
  stat(345, 'Duration', course.duration)
  stat(650, 'Format', 'Live online')

  const priceY = statY + 125
  if (course.offer) {
    context.fillStyle = '#7c8d98'
    context.font = '400 29px Manrope, Arial, sans-serif'
    const original = formatNaira(course.price)
    context.fillText(original, 42, priceY)
    context.strokeStyle = '#7c8d98'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(42, priceY - 11)
    context.lineTo(42 + context.measureText(original).width, priceY - 11)
    context.stroke()
  }
  context.fillStyle = DEEP_NAVY
  context.font = '700 38px Manrope, Arial, sans-serif'
  context.fillText(formatNaira(course.offer ?? course.price), course.offer ? 190 : 42, priceY)

  const buttonY = priceY - 65
  roundedRect(context, 690, buttonY, 330, 70, 35)
  const buttonGradient = context.createLinearGradient(690, buttonY, 1020, buttonY + 70)
  buttonGradient.addColorStop(0, '#aeeef3')
  buttonGradient.addColorStop(1, '#13b9db')
  context.fillStyle = buttonGradient
  context.fill()
  context.fillStyle = DEEP_NAVY
  context.font = '700 24px Manrope, Arial, sans-serif'
  context.fillText('Explore Course  →', 748, buttonY + 44)

  context.fillStyle = DEEP_NAVY
  context.font = '400 18px Manrope, Arial, sans-serif'
  context.fillText(courseUrl.replace(/^https?:\/\//, ''), 42, 900)

  sourceLogo.close()
  image.close()
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create share card')), 'image/png'))
}
