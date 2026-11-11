import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const UP_AXIS = new THREE.Vector3(0, 1, 0)

/**
 * VitePress 向け Three.js 3D シーン共通セットアップ
 * - 高DPI・レスポンシブ ResizeObserver 対応
 * - OrbitControls（ドラッグ回転・ズーム・パン）
 * - カメラ視点プリセットへの滑らかな補間移動 (moveCameraTo: 位置・注視点・FOV対応)
 * - コンポーネント破棄時の完全な WebGL リソース解放 (dispose)
 */
export function createThreeScene(containerEl, options = {}) {
  const {
    fov = 42,
    near = 0.1,
    far = 500,
    background = 0x080c16,
    initialCamPos = [11, 7.5, 13],
    initialTarget = [0, 0, 0],
    minDistance = 4,
    maxDistance = 80,
    onFrame = null
  } = options

  const width = containerEl.clientWidth || 720
  const height = containerEl.clientHeight || 440

  const scene = new THREE.Scene()
  if (background !== null) {
    scene.background = new THREE.Color(background)
  }

  const camera = new THREE.PerspectiveCamera(fov, width / height, near, far)
  camera.position.set(...initialCamPos)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12

  while (containerEl.firstChild) {
    containerEl.removeChild(containerEl.firstChild)
  }
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.cursor = 'grab'
  containerEl.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(...initialTarget)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = minDistance
  controls.maxDistance = maxDistance
  controls.update()

  // 標準3点ライティング
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.15)
  mainLight.position.set(14, 22, 16)
  scene.add(mainLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45)
  rimLight.position.set(-14, -10, -12)
  scene.add(rimLight)

  let camAnim = null
  controls.addEventListener('start', () => {
    camAnim = null
    // ユーザーの手動ドラッグ開始時に望遠FOV状態だった場合は自然なパースへ戻す
    if (camera.fov < 25) {
      const dist = camera.position.distanceTo(controls.target)
      const dir = camera.position.clone().sub(controls.target).normalize()
      const newDist = Math.min(20, Math.max(10, dist * (camera.fov / fov)))
      camera.fov = fov
      camera.position.copy(controls.target).addScaledVector(dir, newDist)
      camera.updateProjectionMatrix()
    }
    renderer.domElement.style.cursor = 'grabbing'
  })
  controls.addEventListener('end', () => {
    renderer.domElement.style.cursor = 'grab'
  })

  function moveCameraTo(posArr, targetArr = [0, 0, 0], duration = 0.5, targetFov = fov) {
    if (duration <= 0) {
      camera.position.set(...posArr)
      controls.target.set(...targetArr)
      camera.fov = targetFov
      camera.up.set(0, 1, 0)
      camera.updateProjectionMatrix()
      controls.update()
      camAnim = null
      return
    }
    camAnim = {
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(...posArr),
      startTarget: controls.target.clone(),
      endTarget: new THREE.Vector3(...targetArr),
      startFov: camera.fov,
      endFov: targetFov,
      elapsed: 0,
      duration
    }
  }

  function resize() {
    if (!containerEl) return
    const w = containerEl.clientWidth || 720
    const h = containerEl.clientHeight || 440
    if (w <= 0 || h <= 0) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  let resizeObserver = null
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(containerEl)
  } else {
    window.addEventListener('resize', resize)
  }

  let rafId = null
  let lastTime = performance.now()
  let totalElapsed = 0
  let disposed = false

  function animate(now) {
    if (disposed) return
    rafId = requestAnimationFrame(animate)
    const rawDt = (now - lastTime) / 1000
    lastTime = now
    const dt = Math.min(Math.max(rawDt, 0), 0.05)
    totalElapsed += dt

    if (camAnim) {
      camAnim.elapsed += dt
      const t = Math.min(1, camAnim.elapsed / camAnim.duration)
      const ease = 1 - Math.pow(1 - t, 3)
      camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, ease)
      controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, ease)
      camera.fov = camAnim.startFov + (camAnim.endFov - camAnim.startFov) * ease
      camera.updateProjectionMatrix()
      if (t >= 1) camAnim = null
    }

    controls.update()
    if (onFrame) {
      onFrame(dt, totalElapsed)
    }
    renderer.render(scene, camera)
  }

  rafId = requestAnimationFrame(animate)

  function disposeObject(obj) {
    if (!obj) return
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
      } else {
        if (obj.material.map) obj.material.map.dispose()
        obj.material.dispose()
      }
    }
  }

  function dispose() {
    disposed = true
    if (rafId !== null) cancelAnimationFrame(rafId)
    if (resizeObserver) resizeObserver.disconnect()
    else window.removeEventListener('resize', resize)
    controls.dispose()
    scene.traverse(disposeObject)
    renderer.dispose()
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    moveCameraTo,
    resize,
    dispose
  }
}

/**
 * 立体感のある 3D ベクトル矢印（円柱シャフト＋円錐ヘッド）を生成
 */
export function createVectorArrow3D(opts = {}) {
  const {
    color = 0x38bdf8,
    shaftRadius = 0.06,
    headRadius = 0.17,
    headLength = 0.42,
    opacity = 1.0
  } = opts

  const group = new THREE.Group()

  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.1,
    transparent: opacity < 1.0,
    opacity
  })

  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, 1, 14)
  shaftGeo.translate(0, 0.5, 0)
  const shaftMesh = new THREE.Mesh(shaftGeo, mat)
  group.add(shaftMesh)

  const headGeo = new THREE.ConeGeometry(headRadius, headLength, 16)
  headGeo.translate(0, headLength / 2, 0)
  const headMesh = new THREE.Mesh(headGeo, mat)
  group.add(headMesh)

  const dirNorm = new THREE.Vector3()

  group.setVector = function (origin, dir, length) {
    if (length <= 0.04 || dir.lengthSq() < 1e-8) {
      group.visible = false
      return
    }
    group.visible = true
    group.position.copy(origin)
    dirNorm.copy(dir).normalize()
    group.quaternion.setFromUnitVectors(UP_AXIS, dirNorm)

    const actualHead = Math.min(headLength, length * 0.45)
    const shaftLen = Math.max(0.01, length - actualHead)
    shaftMesh.scale.set(1, shaftLen, 1)
    headMesh.position.set(0, shaftLen, 0)
    const headScale = actualHead / headLength
    headMesh.scale.set(headScale, headScale, headScale)
  }

  return group
}

/**
 * 常にカメラ正面を向く高精細テキストラベル（Sprite）を生成
 * テキスト変更時は新しい CanvasTexture を生成し WebGL サイズ不整合を防止
 */
export function createTextSprite(textStr, opts = {}) {
  const {
    color = '#f8fafc',
    bgColor = 'rgba(9, 13, 22, 0.86)',
    borderColor = 'rgba(148, 163, 184, 0.4)',
    fontSize = 40,
    scale = 0.68
  } = opts

  const material = new THREE.SpriteMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false
  })

  const sprite = new THREE.Sprite(material)
  sprite.renderOrder = 999

  function drawLabel(str, textColor = color, bdrColor = borderColor) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    ctx.font = `700 ${fontSize}px "Outfit", "Noto Sans JP", sans-serif`
    const metrics = ctx.measureText(str)
    const padX = 24
    const padY = 14
    const w = Math.ceil(metrics.width + padX * 2)
    const h = Math.ceil(fontSize + padY * 2)

    canvas.width = w
    canvas.height = h

    const r = h * 0.32
    ctx.beginPath()
    ctx.moveTo(r, 2)
    ctx.lineTo(w - r, 2)
    ctx.quadraticCurveTo(w - 2, 2, w - 2, r)
    ctx.lineTo(w - 2, h - r)
    ctx.quadraticCurveTo(w - 2, h - 2, w - r, h - 2)
    ctx.lineTo(r, h - 2)
    ctx.quadraticCurveTo(2, h - 2, 2, h - r)
    ctx.lineTo(2, r)
    ctx.quadraticCurveTo(2, 2, r, 2)
    ctx.closePath()

    if (bgColor) {
      ctx.fillStyle = bgColor
      ctx.fill()
    }
    if (bdrColor) {
      ctx.strokeStyle = bdrColor
      ctx.lineWidth = 3
      ctx.stroke()
    }

    ctx.font = `700 ${fontSize}px "Outfit", "Noto Sans JP", sans-serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(str, w / 2, h / 2 + 1)

    if (material.map) {
      material.map.dispose()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    material.map = texture
    material.needsUpdate = true

    const aspect = w / h
    sprite.scale.set(scale * aspect, scale, 1)
  }

  drawLabel(textStr)
  sprite.updateText = drawLabel
  return sprite
}
