// シミュレーター共通の描画・アニメーション補助関数
import { onMounted, onUnmounted } from 'vue'

/** 高DPI対応でキャンバスを初期化し、論理座標(w×h)で描ける ctx を返す */
export function setupCanvas(canvas, w, h) {
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1)
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/** 背景塗りつぶし＋方眼 */
export function clearGrid(ctx, w, h, step = 40, bg = '#09090b') {
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  if (!step) return
  ctx.strokeStyle = 'rgba(63,63,70,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= w; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h) }
  for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5) }
  ctx.stroke()
}

/** 矢印（ベクトル）を描く。長さが短すぎる場合は描かない */
export function arrow(ctx, x1, y1, x2, y2, color = '#fff', width = 2.5, label = '', opts = {}) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 2) return
  const ux = dx / len, uy = dy / len
  const head = Math.min(opts.head ?? 9, len * 0.6)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  if (opts.dash) ctx.setLineDash(opts.dash)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2 - ux * head * 0.8, y2 - uy * head * 0.8)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - ux * head - uy * head * 0.5, y2 - uy * head + ux * head * 0.5)
  ctx.lineTo(x2 - ux * head + uy * head * 0.5, y2 - uy * head - ux * head * 0.5)
  ctx.closePath()
  ctx.fill()
  if (label) {
    ctx.font = opts.font || 'bold 12px sans-serif'
    ctx.textAlign = opts.align || 'left'
    ctx.textBaseline = 'middle'
    const ox = opts.lx ?? 6, oy = opts.ly ?? 0
    ctx.fillText(label, x2 + ox, y2 + oy)
    ctx.textBaseline = 'alphabetic'
  }
  ctx.restore()
}

/** テキスト描画の短縮 */
export function text(ctx, str, x, y, color = '#e4e4e7', font = '12px sans-serif', align = 'left', base = 'alphabetic') {
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = base
  ctx.fillText(str, x, y)
  ctx.textBaseline = 'alphabetic'
}

/** 丸 */
export function dot(ctx, x, y, r, fill, stroke) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke() }
}

/** 線 */
export function line(ctx, x1, y1, x2, y2, color = '#52525b', width = 1, dash) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

/**
 * requestAnimationFrame ループ。step(dt秒) を毎フレーム呼ぶ。
 * マウント時に開始し、アンマウント時に自動停止（SSR安全）。
 */
export function useLoop(step) {
  let id = null
  let last = null
  const frame = (ts) => {
    if (last === null) last = ts
    const dt = Math.min(0.05, (ts - last) / 1000)
    last = ts
    step(dt)
    id = requestAnimationFrame(frame)
  }
  onMounted(() => { id = requestAnimationFrame(frame) })
  onUnmounted(() => { if (id) cancelAnimationFrame(id) })
}

/** キャンバス上のポインタ座標を論理座標へ変換 */
export function pointerPos(canvas, e, w, h) {
  const r = canvas.getBoundingClientRect()
  const p = e.touches ? e.touches[0] : e
  return { x: ((p.clientX - r.left) / r.width) * w, y: ((p.clientY - r.top) / r.height) * h }
}

/** 数値の書式（有効数字風） */
export function fmt(v, d = 2) {
  if (!isFinite(v)) return '—'
  return Number(v).toFixed(d)
}
