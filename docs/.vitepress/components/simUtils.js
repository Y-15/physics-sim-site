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

/** 矢印（ベクトル）を描く。第6引数が options オブジェクトの場合も安全に対応 */
export function arrow(ctx, x1, y1, x2, y2, colorOrOpts = '#fff', width = 2.5, label = '', opts = {}) {
  let color = '#fff'
  let strokeWidth = width
  let finalLabel = label
  let finalOpts = opts

  if (typeof colorOrOpts === 'object' && colorOrOpts !== null) {
    color = colorOrOpts.color || '#fff'
    strokeWidth = colorOrOpts.width ?? 2.5
    finalLabel = colorOrOpts.label ?? ''
    finalOpts = colorOrOpts
  } else {
    color = colorOrOpts
  }

  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 2) return
  const ux = dx / len, uy = dy / len
  const head = Math.min(finalOpts.head ?? 9, len * 0.6)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = strokeWidth
  if (finalOpts.dash) ctx.setLineDash(finalOpts.dash)
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
  if (finalLabel) {
    ctx.font = finalOpts.font || 'bold 12px sans-serif'
    ctx.textAlign = finalOpts.align || 'left'
    ctx.textBaseline = 'middle'
    const ox = finalOpts.lx ?? 6, oy = finalOpts.ly ?? 0
    ctx.fillText(finalLabel, x2 + ox, y2 + oy)
    ctx.textBaseline = 'alphabetic'
  }
  ctx.restore()
}

/** テキスト描画の短縮（第5引数が options オブジェクトでも安全に対応） */
export function text(ctx, str, x, y, colorOrOpts = '#e4e4e7', font = '12px sans-serif', align = 'left', base = 'alphabetic') {
  let color = '#e4e4e7'
  let fontStr = font
  let alignStr = align
  let baseStr = base

  if (typeof colorOrOpts === 'object' && colorOrOpts !== null) {
    color = colorOrOpts.color || '#e4e4e7'
    fontStr = colorOrOpts.font || font
    alignStr = colorOrOpts.align || align
    baseStr = colorOrOpts.base || base
  } else {
    color = colorOrOpts
  }

  ctx.fillStyle = color
  ctx.font = fontStr
  ctx.textAlign = alignStr
  ctx.textBaseline = baseStr
  ctx.fillText(str, x, y)
  ctx.textBaseline = 'alphabetic'
}

/** 丸（fill / stroke 引数が柔軟に対応） */
export function dot(ctx, x, y, r, fill = '#fbbf24', stroke = null, strokeWidth = 1.5) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth; ctx.stroke() }
}

/** 線（第6引数が options オブジェクトでも安全に対応） */
export function line(ctx, x1, y1, x2, y2, colorOrOpts = '#52525b', width = 1, dash = null) {
  let color = '#52525b'
  let lineWidth = width
  let lineDash = dash

  if (typeof colorOrOpts === 'object' && colorOrOpts !== null) {
    color = colorOrOpts.color || '#52525b'
    lineWidth = colorOrOpts.width ?? 1
    lineDash = colorOrOpts.dash ?? null
  } else {
    color = colorOrOpts
  }

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  if (lineDash) ctx.setLineDash(lineDash)
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
export function useLoop(arg1, arg2) {
  let id = null
  let last = null

  if (typeof arg1 === 'function') {
    // 1引数シグネチャ: useLoop(step)
    const step = arg1
    const frame = (ts) => {
      if (last === null) last = ts
      const dt = Math.min(0.05, (ts - last) / 1000)
      last = ts
      step(dt)
      id = requestAnimationFrame(frame)
    }
    onMounted(() => { id = requestAnimationFrame(frame) })
    onUnmounted(() => { if (id) cancelAnimationFrame(id) })
  } else {
    // 2引数シグネチャ: useLoop(canvasRef, callback)
    const canvasRef = arg1
    const callback = arg2

    const frame = (ts) => {
      if (last === null) last = ts
      const dt = Math.min(0.05, (ts - last) / 1000)
      last = ts

      const canvas = canvasRef?.value
      if (canvas && typeof callback === 'function') {
        const rect = canvas.getBoundingClientRect()
        const logicalW = rect.width || canvas.width || 700
        const logicalH = rect.height || canvas.height || 300
        const targetDpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1)

        const pixelW = Math.round(logicalW * targetDpr)
        const pixelH = Math.round(logicalH * targetDpr)
        if (canvas.width !== pixelW || canvas.height !== pixelH) {
          canvas.width = pixelW
          canvas.height = pixelH
        }

        const ctx = canvas.getContext('2d')
        ctx.save()
        ctx.setTransform(targetDpr, 0, 0, targetDpr, 0, 0)
        const payload = { ctx, canvas, width: logicalW, height: logicalH, dt }
        try {
          callback(payload, logicalW, logicalH, dt)
        } catch (e) {
          console.error('Simulation loop error:', e)
        } finally {
          ctx.restore()
        }
      }

      id = requestAnimationFrame(frame)
    }
    onMounted(() => { id = requestAnimationFrame(frame) })
    onUnmounted(() => { if (id) cancelAnimationFrame(id) })
  }
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
