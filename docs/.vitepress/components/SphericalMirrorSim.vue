<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let staticGroup = null
let pulseGroup = null
let pulseSegments = []
let simTime = 0
let lastCamAspect = 0

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

// 鏡の種類: 'concave' (凹面鏡) or 'convex' (凸面鏡)
const mirrorType = ref('concave')
const focalLengthAbs = ref(120) // 焦点距離 |f| [px] (60 ~ 180)
const objectDist = ref(180) // 物体距離 a [px] (40 ~ 300)
const objectHeight = ref(60) // 物体の高さ h [px] (25 ~ 90)

// 符号付き焦点距離 f
// 凹面鏡: 鏡の左側(手前)に焦点があるため f > 0
// 凸面鏡: 鏡の右側(奥)に虚焦点があるため f < 0
const f = computed(() => {
  return mirrorType.value === 'concave' ? focalLengthAbs.value : -focalLengthAbs.value
})

// 写像公式: 1/a + 1/b = 1/f => b = (a * f) / (a - f)
const imageDist = computed(() => {
  const a = objectDist.value
  const fVal = f.value
  if (Math.abs(a - fVal) < 1e-3) return null // 無限遠 (焦点上)
  return (a * fVal) / (a - fVal)
})

// 倍率 m = |b / a|, 像の高さ h' = - (b / a) * h
const imageStats = computed(() => {
  const a = objectDist.value
  const b = imageDist.value
  const h = objectHeight.value
  if (b === null) {
    return {
      bStr: '∞ (平行光線)',
      magStr: '∞',
      type: '結像なし (無限遠)',
      isReal: false,
      isUpright: false,
      imgHeight: 0
    }
  }

  const mag = Math.abs(b / a)
  const hPrime = -(b / a) * h // 負なら倒立、正なら正立
  const isReal = b > 0
  const isUpright = hPrime > 0

  return {
    bStr: `${Math.abs(b).toFixed(1)} px (${b > 0 ? '手前' : '奥'})`,
    magStr: `${mag.toFixed(2)} 倍`,
    type: isReal ? (isUpright ? '実像・正立' : '実像・倒立') : '虚像・正立',
    isReal,
    isUpright,
    imgHeight: hPrime
  }
})

const statusBadgeText = computed(() => {
  if (mirrorType.value === 'convex') {
    return `✓ 凸面鏡 (f < 0)：鏡の奥に常に縮小・正立虚像 (${imageStats.value.magStr}) ｜ 紫破線＝逆延長`
  }
  if (imageDist.value === null) {
    return `⚠ 凹面鏡 (a = f = ${focalLengthAbs.value}px)：反射光が平行になり像を結ばない（無限遠）`
  }
  if (imageStats.value.isReal) {
    const scaleTag = Math.abs(objectDist.value - 2 * focalLengthAbs.value) < 3 ? '等倍 (a=2f)' : (objectDist.value > 2 * focalLengthAbs.value ? '縮小' : '拡大')
    return `✓ 凹面鏡 (a > f)：鏡の手前に${scaleTag}・倒立実像 (${imageStats.value.magStr}) ｜ スクリーン投影可`
  }
  return `✓ 凹面鏡 (a < f・拡大鏡)：鏡の奥に拡大・正立虚像 (${imageStats.value.magStr}) ｜ 紫半透明矢印`
})

const statusBadgeTone = computed(() => {
  if (imageDist.value === null) return 'tone-warn'
  return imageStats.value.isReal ? 'tone-real' : 'tone-virtual'
})

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.15, 1.56 / Math.max(0.62, aspect)) : 1.0
}

function isNarrowViewport() {
  return Boolean(threeCtx?.camera && threeCtx.camera.aspect < 1.35)
}

function getSpriteScale(baseScale = 0.48) {
  if (!isNarrowViewport()) return baseScale
  return baseScale * Math.min(1.9, getMobileScale() * 1.08)
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  const targetX = mirrorType.value === 'concave' ? -0.4 : 0.4
  if (preset === '3d') {
    threeCtx.moveCameraTo([targetX - 4.4 * s, 4.4 * s, 13.8 * s], [targetX, -0.15, 0], duration, 42)
  } else if (preset === 'side') {
    threeCtx.moveCameraTo([targetX, 0.15, 45.0 * s], [targetX, -0.15, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([targetX, 45.0 * s, 0.08], [targetX, 0, 0], duration, 14)
  }
}

function setMirror(type) {
  mirrorType.value = type
  if (type === 'concave') {
    objectDist.value = 180
  } else {
    objectDist.value = 140
  }
  setCameraPreset(activeCam.value, 0.35)
}

function resetSim() {
  mirrorType.value = 'concave'
  focalLengthAbs.value = 120
  objectDist.value = 180
  objectHeight.value = 60
  setCameraPreset('3d')
}

function clearGroup(group) {
  if (!group) return
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    child.traverse(obj => {
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
    })
  }
}

function addRayTube(parent, p1, p2, colorHex, opts = {}) {
  const {
    radius = 0.042,
    opacity = 1.0,
    dashed = false,
    arrowAt = null,
    arrowSize = 0.13
  } = opts
  const dist = p1.distanceTo(p2)
  if (dist < 0.04) return

  if (dashed) {
    const dashLen = 0.22
    const gapLen = 0.16
    const step = dashLen + gapLen
    const dir = p2.clone().sub(p1).normalize()
    const numDashes = Math.max(1, Math.floor((dist + gapLen * 0.5) / step))
    const dashGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, 1, 8)
    const dashMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.48,
      transparent: opacity < 0.99,
      opacity
    })
    const up = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir)
    for (let i = 0; i < numDashes; i++) {
      const startD = i * step
      const lenD = Math.min(dashLen, dist - startD)
      if (lenD < 0.05) break
      const m = new THREE.Mesh(dashGeo, dashMat)
      m.position.copy(p1).addScaledVector(dir, startD + lenD * 0.5)
      m.quaternion.copy(q)
      m.scale.set(1, lenD, 1)
      m.renderOrder = 2
      parent.add(m)
    }
    return
  }

  const curve = new THREE.LineCurve3(p1, p2)
  const geo = new THREE.TubeGeometry(curve, 12, radius, 10, false)
  const isTransparent = opacity < 0.99
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.56,
    roughness: 0.18,
    transparent: isTransparent,
    opacity
  })
  const tubeMesh = new THREE.Mesh(geo, mat)
  tubeMesh.renderOrder = 2
  parent.add(tubeMesh)

  if (arrowAt !== null && dist > 0.45) {
    const dir = p2.clone().sub(p1).normalize()
    const coneGeo = new THREE.ConeGeometry(arrowSize, arrowSize * 2.3, 12)
    const coneMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.75,
      roughness: 0.15
    })
    const cone = new THREE.Mesh(coneGeo, coneMat)
    cone.position.lerpVectors(p1, p2, arrowAt)
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    cone.renderOrder = 3
    parent.add(cone)
  }
}

function registerPulse(p1, p2, colorHex, offset = 0) {
  if (p1.distanceTo(p2) < 0.1) return
  pulseSegments.push({ p1: p1.clone(), p2: p2.clone(), colorHex, offset })
}

function clipRayEndToBounds(origin, dir, maxDist = 14, minX = -7.3, maxX = 7.3, minY = -2.85, maxY = 2.95) {
  let tMax = maxDist
  if (Math.abs(dir.x) > 1e-6) {
    const tx = dir.x > 0 ? (maxX - origin.x) / dir.x : (minX - origin.x) / dir.x
    if (tx > 0) tMax = Math.min(tMax, tx)
  }
  if (Math.abs(dir.y) > 1e-6) {
    const ty = dir.y > 0 ? (maxY - origin.y) / dir.y : (minY - origin.y) / dir.y
    if (ty > 0) tMax = Math.min(tMax, ty)
  }
  return origin.clone().addScaledVector(dir, Math.max(0.05, tMax))
}

function rebuildScene() {
  if (!staticGroup || !pulseGroup) return
  clearGroup(staticGroup)
  clearGroup(pulseGroup)
  pulseSegments = []

  const s = 0.018 // 1 px = 0.018 Three.js units
  const isConcave = mirrorType.value === 'concave'
  const mirrorX = isConcave ? 2.6 : 0.4
  const floorY = -3.15
  const railTopY = floorY + 0.24
  const fAbsU = focalLengthAbs.value * s
  const R = 2 * fAbsU // 曲率半径 R = 2|f|

  // 1. 3D 光学ベンチ床グリッド & 光沢金属光学レール
  const benchCenterX = isConcave ? -0.4 : 0.4
  const grid = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a)
  grid.position.set(benchCenterX, floorY - 0.02, 0)
  staticGroup.add(grid)

  const railGeo = new THREE.BoxGeometry(15.2, 0.24, 0.96)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.78,
    roughness: 0.28
  })
  const rail = new THREE.Mesh(railGeo, railMat)
  rail.position.set(benchCenterX, floorY + 0.12, 0)
  staticGroup.add(rail)

  const trimGeo = new THREE.BoxGeometry(15.2, 0.04, 0.05)
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.42,
    metalness: 0.8
  })
  const trimF = new THREE.Mesh(trimGeo, trimMat)
  trimF.position.set(benchCenterX, railTopY + 0.01, 0.47)
  const trimB = new THREE.Mesh(trimGeo, trimMat)
  trimB.position.set(benchCenterX, railTopY + 0.01, -0.47)
  staticGroup.add(trimF, trimB)

  // 光軸 (y = 0, z = 0)
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(benchCenterX - 7.5, 0, 0),
    new THREE.Vector3(benchCenterX + 7.5, 0, 0)
  ])
  staticGroup.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.72 })))

  // 2. 彫刻された 3D 反射ミラーシェル + ブラシ仕上げ金属バッキング
  const dishRadius = Math.min(2.62, R * 0.88)
  const steps = 28
  const frontPts = []
  const midPts = []
  const backPts = []
  const coatThick = 0.055
  const backThick = 0.16

  function getMirrorXAtY(r) {
    const clampedR = Math.min(r, R * 0.94)
    const sag = R - Math.sqrt(Math.max(0, R * R - clampedR * clampedR))
    return isConcave ? mirrorX - sag : mirrorX + sag
  }

  for (let i = 0; i <= steps; i++) {
    const r = (i / steps) * dishRadius
    const xPos = getMirrorXAtY(r)
    frontPts.push(new THREE.Vector2(r, xPos))
    midPts.push(new THREE.Vector2(r, xPos + coatThick))
    backPts.push(new THREE.Vector2(r, xPos + coatThick + backThick))
  }

  // (a) 前面：光沢鏡面コート層 (depthWrite: false で鏡背後の虚光線・虚像を遮蔽しない)
  const frontProfile = [...frontPts, ...[...midPts].reverse(), frontPts[0].clone()]
  const frontGeo = new THREE.LatheGeometry(frontProfile, 48)
  frontGeo.rotateZ(-Math.PI / 2)
  const frontMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.22,
    metalness: 0.94,
    roughness: 0.07,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  const frontMesh = new THREE.Mesh(frontGeo, frontMat)
  frontMesh.renderOrder = 1
  staticGroup.add(frontMesh)

  // (b) 背面：ブラシ仕上げダークメタル・バッキング層
  const backProfile = [...midPts, ...[...backPts].reverse(), midPts[0].clone()]
  const backGeo = new THREE.LatheGeometry(backProfile, 48)
  backGeo.rotateZ(-Math.PI / 2)
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.72,
    roughness: 0.42,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  const backMesh = new THREE.Mesh(backGeo, backMat)
  backMesh.renderOrder = 0
  staticGroup.add(backMesh)

  // 外周リムリング & 台座支柱
  const rimX = getMirrorXAtY(dishRadius)
  const rimGeo = new THREE.TorusGeometry(dishRadius, 0.06, 16, 48)
  rimGeo.rotateY(Math.PI / 2)
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.4,
    metalness: 0.8,
    roughness: 0.2
  })
  const rimMesh = new THREE.Mesh(rimGeo, rimMat)
  rimMesh.position.set(rimX, 0, 0)
  staticGroup.add(rimMesh)

  const pillarLen = Math.max(0.2, Math.abs(railTopY) - dishRadius + 0.14)
  const mPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, pillarLen, 16),
    railMat
  )
  mPillar.position.set(rimX + 0.08, railTopY + pillarLen / 2, 0)
  staticGroup.add(mPillar)

  const mStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 1.06),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.3 })
  )
  mStand.position.set(rimX + 0.08, railTopY + 0.08, 0)
  staticGroup.add(mStand)

  const narrow = isNarrowViewport()
  const mirrorLbl = createTextSprite(
    narrow
      ? (isConcave ? '3D 凹面鏡' : '3D 凸面鏡')
      : (isConcave ? '3D 凹面鏡 (f > 0: 収束)' : '3D 凸面鏡 (f < 0: 発散)'),
    { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 34, scale: getSpriteScale(0.54) }
  )
  mirrorLbl.position.set(mirrorX - (isConcave ? 0.55 : 0.25), dishRadius + (narrow ? 0.72 : 0.56), -1.45)
  staticGroup.add(mirrorLbl)

  // 3. 頂点 V, 焦点 F, 曲率中心 C の3Dマーカー (z = +0.92 で真上視点でも非重複)
  const focusX = isConcave ? mirrorX - fAbsU : mirrorX + fAbsU
  const centerX = isConcave ? mirrorX - 2 * fAbsU : mirrorX + 2 * fAbsU

  const points = [
    { x: mirrorX, label: narrow ? 'V' : 'V(頂点)', color: 0x38bdf8, textCol: '#7dd3fc', zOff: 0.92 },
    { x: focusX, label: narrow ? 'F' : 'F(焦点)', color: 0xfbbf24, textCol: '#fde68a', zOff: 0.92 },
    { x: centerX, label: narrow ? 'C' : 'C(中心)', color: 0x94a3b8, textCol: '#cbd5e1', zOff: 0.92 }
  ]

  points.forEach(pt => {
    if (pt.x < benchCenterX - 7.3 || pt.x > benchCenterX + 7.3) return
    const sGeo = new THREE.SphereGeometry(0.115, 16, 16)
    const sMat = new THREE.MeshStandardMaterial({
      color: pt.color,
      emissive: pt.color,
      emissiveIntensity: 0.6
    })
    const m = new THREE.Mesh(sGeo, sMat)
    m.position.set(pt.x, 0, 0)
    staticGroup.add(m)

    const sp = createTextSprite(pt.label, {
      color: pt.textCol,
      borderColor: pt.label.startsWith('F') ? '#fbbf24' : 'rgba(148,163,184,0.45)',
      fontSize: 30,
      scale: getSpriteScale(0.42)
    })
    sp.position.set(pt.x, narrow ? -0.58 : -0.46, pt.zOff)
    staticGroup.add(sp)
  })

  // 4. 3D 物体矢印 & 台座 (ローズ #f43f5e)
  const objX = mirrorX - objectDist.value * s
  const objH = objectHeight.value * s
  const objArrow = createVectorArrow3D({
    color: 0xf43f5e,
    shaftRadius: 0.08,
    headRadius: 0.21,
    headLength: 0.42
  })
  objArrow.setVector(new THREE.Vector3(objX, 0, 0), new THREE.Vector3(0, 1, 0), objH)
  staticGroup.add(objArrow)

  const objStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.14, 0.98),
    new THREE.MeshStandardMaterial({ color: 0x9f1239, metalness: 0.5, roughness: 0.35 })
  )
  objStand.position.set(objX, railTopY + 0.07, 0)
  staticGroup.add(objStand)
  const objPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, Math.abs(railTopY), 10),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
  )
  objPost.position.set(objX, railTopY / 2, 0)
  staticGroup.add(objPost)

  // 5. 像の計算と3本の代表3D光線の精密追跡
  const b = imageDist.value
  const tipPos = new THREE.Vector3(objX, objH, 0)
  const hitX1 = getMirrorXAtY(objH)
  const hitPos1 = new THREE.Vector3(hitX1, objH, 0)
  const vertexPos = new THREE.Vector3(mirrorX, 0, 0)
  const focusPos = new THREE.Vector3(focusX, 0, 0)
  const centerPos = new THREE.Vector3(centerX, 0, 0)

  const hasFinite = b !== null
  const imgX = hasFinite ? mirrorX - b * s : 0
  const imgH = hasFinite ? imageStats.value.imgHeight * s : 0
  const isReal = hasFinite && b > 0
  const imgTip = new THREE.Vector3(imgX, imgH, 0)

  const virtualNearObj = hasFinite && !isReal && Math.abs(imgX - objX) < 1.5
  const objLbl = createTextSprite(
    narrow ? `物体 a=${objectDist.value}` : `物体 (a=${objectDist.value}px)`,
    {
      color: '#fda4af',
      borderColor: '#f43f5e',
      fontSize: 32,
      scale: getSpriteScale(0.48)
    }
  )
  objLbl.position.set(
    virtualNearObj ? objX - 0.55 : objX,
    objH + (narrow ? 0.68 : 0.50),
    -0.92
  )
  staticGroup.add(objLbl)

  const minBX = benchCenterX - 7.1
  const maxBX = benchCenterX + 7.1

  // 光線① (ゴールド #fbbf24): 光軸に平行 -> 球面鏡で反射して焦点 F を通る/Fから発散
  addRayTube(staticGroup, tipPos, hitPos1, 0xfbbf24, { radius: 0.044, arrowAt: 0.52, arrowSize: 0.13 })
  registerPulse(tipPos, hitPos1, 0xfbbf24, 0)

  if (isConcave) {
    let dirRef1
    if (hasFinite && isReal) {
      dirRef1 = imgTip.clone().sub(hitPos1).normalize()
    } else if (hasFinite && !isReal) {
      dirRef1 = hitPos1.clone().sub(imgTip).normalize()
    } else {
      dirRef1 = focusPos.clone().sub(hitPos1).normalize()
    }
    const refEnd1 = clipRayEndToBounds(hitPos1, dirRef1, 14, minBX, maxBX)
    addRayTube(staticGroup, hitPos1, refEnd1, 0xfbbf24, { radius: 0.044, arrowAt: 0.55, arrowSize: 0.13 })
    registerPulse(hitPos1, refEnd1, 0xfbbf24, 0.35)

    if (hasFinite && !isReal) {
      const virtEnd1 = clipRayEndToBounds(hitPos1, dirRef1.clone().negate(), hitPos1.distanceTo(imgTip), minBX, maxBX)
      addRayTube(staticGroup, hitPos1, virtEnd1, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
    }
  } else {
    // 凸面鏡: 奥の焦点 F から発散する向きへ反射
    const dirRef1 = hitPos1.clone().sub(focusPos).normalize()
    const refEnd1 = clipRayEndToBounds(hitPos1, dirRef1, 14, minBX, maxBX)
    addRayTube(staticGroup, hitPos1, refEnd1, 0xfbbf24, { radius: 0.044, arrowAt: 0.55, arrowSize: 0.13 })
    registerPulse(hitPos1, refEnd1, 0xfbbf24, 0.35)
    addRayTube(staticGroup, hitPos1, focusPos, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
  }

  // 光線② (スカイシアン #38bdf8): 頂点 V に入射 -> 上下対称に反射
  addRayTube(staticGroup, tipPos, vertexPos, 0x38bdf8, { radius: 0.044, arrowAt: 0.52, arrowSize: 0.13 })
  registerPulse(tipPos, vertexPos, 0x38bdf8, 0.15)

  const dirRef2 = new THREE.Vector3(objX - mirrorX, -objH, 0).normalize()
  const refEnd2 = clipRayEndToBounds(vertexPos, dirRef2, 14, minBX, maxBX)
  addRayTube(staticGroup, vertexPos, refEnd2, 0x38bdf8, { radius: 0.044, arrowAt: 0.55, arrowSize: 0.13 })
  registerPulse(vertexPos, refEnd2, 0x38bdf8, 0.5)

  if (hasFinite && !isReal) {
    const virtEnd2 = clipRayEndToBounds(vertexPos, dirRef2.clone().negate(), vertexPos.distanceTo(imgTip), minBX, maxBX)
    addRayTube(staticGroup, vertexPos, virtEnd2, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
  }

  // 光線③ (エメラルド #10b981): 焦点光線 (ミラー範囲内なら) または 曲率中心 C 光線
  if (hasFinite && Math.abs(imgH) <= dishRadius * 0.94) {
    const hitX3 = getMirrorXAtY(Math.abs(imgH))
    const hitPos3 = new THREE.Vector3(hitX3, imgH, 0)
    addRayTube(staticGroup, tipPos, hitPos3, 0x10b981, { radius: 0.042, arrowAt: 0.52, arrowSize: 0.125 })
    registerPulse(tipPos, hitPos3, 0x10b981, 0.25)

    const parEnd = new THREE.Vector3(minBX, imgH, 0)
    addRayTube(staticGroup, hitPos3, parEnd, 0x10b981, { radius: 0.042, arrowAt: 0.55, arrowSize: 0.125 })
    registerPulse(hitPos3, parEnd, 0x10b981, 0.6)

    if (!isReal) {
      const virtEnd3 = clipRayEndToBounds(hitPos3, new THREE.Vector3(1, 0, 0), Math.max(0.1, imgX - hitX3), minBX, maxBX)
      addRayTube(staticGroup, hitPos3, virtEnd3, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
    }
  } else {
    // 焦点光線が鏡面を外れる場合 (a ≈ f や a < f 高倍率): 曲率中心 C からの垂直入射光線を描画
    const cDir = isConcave ? tipPos.clone().sub(centerPos).normalize() : centerPos.clone().sub(tipPos).normalize()
    if (cDir.x > 0.08) {
      const tHitC = (mirrorX - tipPos.x) / cDir.x
      const yHitC = tipPos.y + cDir.y * tHitC
      if (Math.abs(yHitC) <= dishRadius * 0.94) {
        const hitPosC = new THREE.Vector3(getMirrorXAtY(Math.abs(yHitC)), yHitC, 0)
        addRayTube(staticGroup, tipPos, hitPosC, 0x10b981, { radius: 0.04, arrowAt: 0.5, arrowSize: 0.12 })
        const backC = clipRayEndToBounds(hitPosC, cDir.clone().negate(), 12, minBX, maxBX)
        addRayTube(staticGroup, hitPosC, backC, 0x10b981, { radius: 0.04, arrowAt: 0.55, arrowSize: 0.12 })
        registerPulse(tipPos, hitPosC, 0x10b981, 0.25)
        registerPulse(hitPosC, backC, 0x10b981, 0.6)
        if (hasFinite && !isReal) {
          const virtEndC = clipRayEndToBounds(hitPosC, cDir, hitPosC.distanceTo(imgTip), minBX, maxBX)
          addRayTube(staticGroup, hitPosC, virtEndC, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
        }
      }
    }
  }

  // 6. 3D 像矢印とラベル (実像: 固体エメラルド #10b981 / 虚像: 半透明バイオレット #a855f7 + 虚像ラベル)
  if (!hasFinite) {
    const infLbl = createTextSprite(narrow ? '平行反射 (a=f)' : '平行反射（a = f：像なし）', {
      color: '#fde68a',
      borderColor: '#f59e0b',
      fontSize: 32,
      scale: getSpriteScale(0.50)
    })
    infLbl.position.set(benchCenterX - 3.6, -1.85, 0.45)
    staticGroup.add(infLbl)
  } else {
    const fitsBench = imgX >= minBX + 0.15 && imgX <= maxBX - 0.15 && Math.abs(imgH) <= 3.55 && Math.abs(imgH) > 0.05
    if (fitsBench) {
      const imgColor = isReal ? 0x10b981 : 0xa855f7
      const imgArrow = createVectorArrow3D({
        color: imgColor,
        shaftRadius: 0.075,
        headRadius: 0.20,
        headLength: 0.40,
        opacity: isReal ? 1.0 : 0.62
      })
      const dirImg = imgH >= 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0)
      imgArrow.setVector(new THREE.Vector3(imgX, 0, 0), dirImg, Math.abs(imgH))
      staticGroup.add(imgArrow)

      const tipDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 14, 14),
        new THREE.MeshBasicMaterial({ color: isReal ? 0x34d399 : 0xc084fc })
      )
      tipDot.position.copy(imgTip)
      staticGroup.add(tipDot)

      if (isReal) {
        const scrH = Math.max(2.0, Math.abs(imgH) + 0.85)
        const scrGeo = new THREE.PlaneGeometry(scrH * 0.85, scrH)
        const scrMesh = new THREE.Mesh(
          scrGeo,
          new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.11,
            depthWrite: false,
            side: THREE.DoubleSide
          })
        )
        scrMesh.rotation.y = Math.PI / 2
        scrMesh.position.set(imgX - 0.05, imgH / 2, 0)
        scrMesh.renderOrder = 1
        staticGroup.add(scrMesh)

        const scrEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(scrGeo),
          new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.55, depthWrite: false })
        )
        scrEdge.rotation.y = Math.PI / 2
        scrEdge.position.copy(scrMesh.position)
        scrEdge.renderOrder = 1
        staticGroup.add(scrEdge)
      }

      const imgLabel = createTextSprite(
        isReal ? `実像 (m=${Math.abs(b / objectDist.value).toFixed(2)})` : `虚像 (m=${Math.abs(b / objectDist.value).toFixed(2)})`,
        {
          color: isReal ? '#6ee7b7' : '#e9d5ff',
          borderColor: isReal ? '#10b981' : '#c084fc',
          fontSize: 32,
          scale: getSpriteScale(0.50)
        }
      )

      let lx = imgX
      let ly = imgH >= 0 ? imgH + (narrow ? 0.65 : 0.50) : imgH - (narrow ? 0.72 : 0.50)
      let lz = -0.92

      // 衝突回避 (V/F/C や mirrorLbl, objLbl との接触防止・全視点Z分離)
      if (!isReal) {
        lz = 0.0 // 虚像は鏡の右(+x)にあり、V(z=+0.92)・mirrorLbl(z=-1.45)と完全分離
        if (isConcave && imgH > 1.75) {
          // 凹面鏡 a < f 拡大虚像: 3D 凹面鏡タイトル (mirrorX-0.55, dishRadius+0.56) とぶつからないよう右側・やや下へ逃がす
          lx = Math.min(maxBX - 1.15, imgX + 0.92)
          ly = Math.min(2.15, imgH * 0.78)
        } else if (Math.abs(lx - mirrorX) < 1.2) {
          lz = -1.15
        }
      }
      if (imgH < 0) {
        const nearAxisMarker = [mirrorX, focusX, centerX].some(mx => Math.abs(lx - mx) < 1.35)
        const minNegY = narrow ? -1.72 : -1.24
        if (nearAxisMarker && ly > minNegY) {
          ly = minNegY
        }
      } else {
        if (!(!isReal && isConcave && imgH > 1.75)) {
          if (Math.abs(lx - mirrorX) < 1.4 && ly > dishRadius - 0.1) {
            lx = Math.max(lx, mirrorX + 1.35)
          }
          if (virtualNearObj && Math.abs(ly - (objH + 0.50)) < 0.78) {
            lx = Math.max(lx, objX + 1.1)
            ly = Math.max(0.75, ly - 0.25)
          }
        }
      }
      imgLabel.position.set(lx, ly, lz)
      staticGroup.add(imgLabel)
    } else if (Math.abs(imgH) > 0.05) {
      const clampedX = Math.max(minBX + 1.4, Math.min(maxBX - 1.4, imgX))
      const edgeLbl = createTextSprite(
        isReal
          ? `← 実像 (b=+${b.toFixed(0)}px, ${imageStats.value.magStr})`
          : `→ 虚像 (b=${b.toFixed(0)}px, ${imageStats.value.magStr})`,
        {
          color: isReal ? '#6ee7b7' : '#e9d5ff',
          borderColor: isReal ? '#10b981' : '#c084fc',
          fontSize: 30,
          scale: getSpriteScale(0.48)
        }
      )
      edgeLbl.position.set(clampedX, isReal ? -2.2 : 2.3, 0.45)
      staticGroup.add(edgeLbl)
    }
  }

  // 光子パルス球の生成
  const sphereGeo = new THREE.SphereGeometry(0.088, 12, 12)
  pulseSegments.forEach(seg => {
    const mat = new THREE.MeshBasicMaterial({ color: seg.colorHex })
    seg.meshes = []
    for (let i = 0; i < 2; i++) {
      const m = new THREE.Mesh(sphereGeo, mat)
      pulseGroup.add(m)
      seg.meshes.push(m)
    }
  })
}

function updatePulses(dt) {
  if (isPlaying.value) {
    simTime += dt * timeScale.value
  }
  pulseSegments.forEach(seg => {
    if (!seg.meshes) return
    for (let i = 0; i < seg.meshes.length; i++) {
      const t = ((simTime * 0.7 + seg.offset + i * 0.5) % 1 + 1) % 1
      seg.meshes[i].position.lerpVectors(seg.p1, seg.p2, t)
    }
  })
}

watch([mirrorType, focalLengthAbs, objectDist, objectHeight], () => {
  rebuildScene()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [-4.8, 4.4, 13.8],
    initialTarget: [-0.4, -0.15, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        rebuildScene()
      }
      updatePulses(dt)
    }
  })
  staticGroup = new THREE.Group()
  pulseGroup = new THREE.Group()
  threeCtx.scene.add(staticGroup)
  threeCtx.scene.add(pulseGroup)
  rebuildScene()
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🪞</span>
        <span>3D 凹面鏡・凸面鏡の光線追跡と写像シミュレーター</span>
      </div>
      <div class="badge">Three.js 3D × 球面反射の写像公式</div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 正面視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button
        class="btn btn-primary-sm"
        @click="isPlaying = !isPlaying"
      >
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🐢 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>平行光線</span>
        <span class="legend-item"><i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>頂点光線</span>
        <span class="legend-item"><i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>焦点/中心光線・実像</span>
        <span class="legend-item"><i style="background:#a78bfa;box-shadow:0 0 6px #a78bfa"></i>虚像・延長破線</span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 光学ステータスバッジ (ビューポート外・モバイル非重複) -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :class="statusBadgeTone">
        {{ statusBadgeText }}
      </span>
    </div>

    <!-- テレメトリモニター (3D画面を塞がないようビューポート直下に配置) -->
    <div class="mirror-stats-grid">
      <div class="mirror-stat hl">
        <div class="k">鏡の種類</div>
        <div class="v" style="color:#38bdf8">{{ mirrorType === 'concave' ? '凹面鏡 (f > 0)' : '凸面鏡 (f < 0)' }}</div>
      </div>
      <div class="mirror-stat">
        <div class="k">物体距離 <i>a</i></div>
        <div class="v">{{ objectDist }} <small>px</small></div>
      </div>
      <div class="mirror-stat">
        <div class="k">像距離 <i>b</i></div>
        <div class="v">{{ imageStats.bStr }}</div>
      </div>
      <div class="mirror-stat">
        <div class="k">倍率 <i>m</i></div>
        <div class="v" style="color:#fbbf24">{{ imageStats.magStr }}</div>
      </div>
      <div class="mirror-stat">
        <div class="k">像の性質</div>
        <div class="v" :style="{ color: imageStats.isReal ? '#10b981' : '#c084fc' }">{{ imageStats.type }}</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="mirror-toggle">
        <span class="toggle-lbl">鏡の切り替え:</span>
        <button
          class="mode-btn"
          :class="{ active: mirrorType === 'concave' }"
          @click="setMirror('concave')"
        >
          凹面鏡（収束・コスメ鏡/反射望遠鏡）
        </button>
        <button
          class="mode-btn"
          :class="{ active: mirrorType === 'convex' }"
          @click="setMirror('convex')"
        >
          凸面鏡（発散・カーブミラー/広角）
        </button>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>物体距離 <i>a</i>: <span>{{ objectDist }} px</span></label>
          <input type="range" v-model.number="objectDist" min="40" max="300" step="5" />
        </div>
        <div class="control-group">
          <label>焦点距離 |<i>f</i>|: <span>{{ focalLengthAbs }} px</span></label>
          <input type="range" v-model.number="focalLengthAbs" min="60" max="180" step="5" />
        </div>
        <div class="control-group">
          <label>物体の高さ <i>h</i>: <span>{{ objectHeight }} px</span></label>
          <input type="range" v-model.number="objectHeight" min="25" max="90" step="5" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-reset" @click="resetSim">リセット</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.7rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 10px;
}

.preset-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #38bdf8;
}

.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.chip-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.22);
  color: #38bdf8;
  border-color: #38bdf8;
  font-weight: 700;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 0 0.65rem 0;
  padding: 7px 12px;
  border-radius: 10px;
}

.btn-primary-sm {
  background: linear-gradient(135deg, #0284c7, #38bdf8);
  color: #fff;
  border: none;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 4px 10px;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
}

.speed-label,
.speed-btn-group button {
  white-space: nowrap;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 0.65rem;
}

.three-viewport {
  width: 100%;
  height: 100%;
}

.three-hud-legend {
  position: absolute;
  top: 10px;
  left: 12px;
  max-width: calc(100% - 24px);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.74rem;
  color: #e2e8f0;
  pointer-events: none;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
  pointer-events: none;
}

.ortho-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 0.75rem 0;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  max-width: 100%;
}

.three-ortho-badge.tone-real {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.three-ortho-badge.tone-virtual {
  background: rgba(168, 85, 247, 0.18);
  border: 1px solid rgba(192, 132, 252, 0.5);
  color: #e9d5ff;
}

.three-ortho-badge.tone-warn {
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fde68a;
}

.mirror-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.55rem;
  margin-bottom: 0.9rem;
}

.mirror-stat {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  padding: 0.55rem 0.65rem;
  text-align: center;
}

.mirror-stat.hl {
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(56, 189, 248, 0.07);
}

.mirror-stat .k {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 0.18rem;
}

.mirror-stat .v {
  font-size: 0.96rem;
  font-weight: 700;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.mirror-stat .v small {
  font-size: 0.72rem;
  font-weight: 400;
  color: #94a3b8;
}

.controls-panel {
  margin-top: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.mirror-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toggle-lbl {
  font-size: 0.78rem;
  color: #94a3b8;
}

.mode-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.78rem;
  color: #cbd5e1;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 0.35rem 0.85rem;
  font-size: 0.76rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}

@media (max-width: 768px) {
  .sim-container {
    padding: 0.95rem;
  }
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.68rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    font-size: 0.70rem;
    padding: 4px 9px;
  }
}

@media (max-width: 640px) {
  .speed-control-group {
    border-radius: 10px;
    padding: 5px 9px;
    width: 100%;
  }
  .ortho-status-strip {
    justify-content: flex-start;
  }
}
</style>
