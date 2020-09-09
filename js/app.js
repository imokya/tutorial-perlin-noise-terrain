const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vec3 pos = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
  }
`

import * as THREE from './vendors/three.module.js'
import { OrbitControls } from './vendors/OrbitControls.js'

class App {
  
  constructor() {
    this.init()
  }

  init() {

    this.offsetX = 0
    this.offsetY = 0

    this.planeW = 200
    this.planeH = 200
    this.planeSW = 150
    this.planeSH = 150

    this.w = window.innerWidth
    this.h = window.innerHeight
    this.scene = new THREE.Scene()
    //this.scene.fog = new THREE.FogExp2('rgb(78, 216, 195)', 0.01)
    this.camera = new THREE.PerspectiveCamera(60, this.w / this.h, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setSize(this.w, this.h)

    this.camera.position.set(0, 0, 15)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    document.getElementById('app').appendChild(this.renderer.domElement)
    window.addEventListener('resize', this.resize.bind(this))

    this.setup()
    this.setupLights()
    this.resize()
    this.update()
  }

  setupLights() {
    const r = 30
    const y = 10
    const lightDistance = 500

    let conf = {
      lightIntensity: 0.9,
      light1Color: 0x0E09DC,
      light2Color: 0x1CD1E1,
      light3Color: 0x18C02C,
      light4Color: 0xee3bcf
    }

    let light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance)
    light1.position.set(0, y, r)
    this.scene.add(light1)

    let light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance)
    light2.position.set(0, -y, -r)
    this.scene.add(light2)

    let light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance)
    light3.position.set(r, y, 0)
    this.scene.add(light3)

    let light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance)
    light4.position.set(-r, y, 0)
    this.scene.add(light4)

    this.light1 = light1
    this.light2 = light2
    this.light3 = light3
    this.light4 = light4
  }

  setup() {

    this.groundGeo = new THREE.PlaneBufferGeometry(this.planeW, this.planeH, this.planeSW, this.planeSH)
    this.groundMat = new THREE.MeshLambertMaterial({ 
      color: 0xffffff, 
      side: THREE.DoubleSide
    })

    this.ground = new THREE.Mesh(this.groundGeo, this.groundMat)
    this.ground.rotation.x = -Math.PI / 2.5
    this.scene.add(this.ground)


    this.simplex = new SimplexNoise()
  }

  resize() {
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.renderer.setSize(this.w, this.h)
    this.camera.aspect = this.w / this.h
    this.camera.updateProjectionMatrix()
  }

  updatePlane() {
    let pos = this.groundGeo.attributes.position.array
    this.offsetX += 0.01
    this.offsetY = 0

    for(let i = 0; i < pos.length; i+=3) {
      let x = pos[i]
      let y = pos[i+1]

      let dx = this.planeW / this.planeSW
      let dy = this.planeH / this.planeSH

      let row = Math.floor((y+10) / dy)
      let col = Math.floor((x+10) / dx)

      let tx = this.offsetX
      let ty = this.offsetY

      tx += row * 0.05
      ty += col * 0.05

      pos[i+2] = this.simplex.noise2D(tx, ty) * 5

    }
    this.groundGeo.attributes.position.needsUpdate = true
  }

  updateLights() {
    const time = Date.now() * 0.001
    const d = 10
    this.light1.position.x = Math.sin(time * 0.1) * d
    this.light1.position.z = Math.cos(time * 0.2) * d
    this.light2.position.x = Math.cos(time * 0.3) * d
    this.light2.position.z = Math.sin(time * 0.4) * d
    this.light3.position.x = Math.sin(time * 0.5) * d
    this.light3.position.z = Math.sin(time * 0.6) * d
    this.light4.position.x = Math.sin(time * 0.7) * d
    this.light4.position.z = Math.cos(time * 0.8) * d
  }

  update() {
    this.updatePlane()
    this.updateLights()
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.update.bind(this))
  }
 
}

const app = new App()