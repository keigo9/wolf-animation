import * as THREE from 'three';
import style from '/style.css';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from 'lil-gui';

async function init() {
  //const gui = new GUI();
  // シーンを初期化
  const scene = new THREE.Scene();
  let mixer;
  let clock = new THREE.Clock();

  // モデルを読み込む
  const loader = new GLTFLoader();
  //const model = await loader.loadAsync(`./assets/dream_wolves_character_carnifex/scene.gltf`); // GLTFファイルをURLで指定する
  //model.scene.scale.set(0.4, 0.4, 0.4);           // モデルが大きいので縮小する
  //model.scene.position.set(-250, 0, -600);
  //model.scene.rotation.y = -0.3;
  const model = await loader.loadAsync(`/assets/wolf/scene.gltf`); // GLTFファイルをURLで指定する
  model.scene.position.z = -3;
  model.scene.rotation.x = 0.3;
  model.scene.rotation.y = -0.8;

  //model.scene.rotateY(Math.PI);
  model.scene.traverse((object) => { //モデルの構成要素をforEach的に走査
    if (object.isMesh) { //その構成要素がメッシュだったら
      object.material.trasparent = true;
      object.material.opacity = 0.5;
      //object.material.depthTest = true;//陰影で消える部分
    }
  });
  // animations
  const animations = model.animations;
  if (animations && animations.length) {

    //Animation Mixerインスタンスを生成
    mixer = new THREE.AnimationMixer(model.scene);

    //全てのAnimation Clipに対して
    for (let i = 0; i < animations.length; i++) {
      let animation = animations[i];

      //Animation Actionを生成
      let action = mixer.clipAction(animation);

      //ループ設定（1回のみ）
      //action.setLoop(THREE.LoopOnce);

      //アニメーションの最後のフレームでアニメーションが終了
      action.clampWhenFinished = true;

      //アニメーションを再生
      action.play();
    }
  }

  // particles
  const length = 6000;
  const plane_scale = 0.5;
  const plane = [];

  for (let i = 0; i < length; i++) {
    let geometry = new THREE.SphereGeometry(plane_scale, 32, 16);
    var material = new THREE.MeshBasicMaterial({
      color: '0xcccccc',
      opacity: 0.5,
      //transparent: true,
    });

    plane[i] = new THREE.Mesh(geometry, material);

    plane[i].position.x = window.innerWidth * (Math.random() - 0.5);
    plane[i].position.y = window.innerHeight * (Math.random() - 0.5) * 1.3;
    plane[i].position.z = window.innerWidth * (Math.random() - 0.5);
    scene.add(plane[i]);
  }
  function random(min, max) {
    let rand = Math.floor((min + (max - min + 1) * Math.random()));
    return rand;
  }

  //moon
  let moon;
  function createMesh(r, path) {
    // テクスチャ
    let txLoader = new THREE.TextureLoader();
    let normalMap = txLoader.load(path);
    // ジオメトリ
    let geometry = new THREE.SphereBufferGeometry(window.innerWidth, r, r);
    // マテリアル
    let material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: normalMap
    });
    // メッシュ
    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  moon = createMesh(30, "./assets/moonmap4k.jpg");
  if (window.innerWidth < 765) {
    moon.scale.set(0.3, 0.3, 0.3);
  } else {
    moon.scale.set(0.1, 0.1, 0.1);
  }
  moon.position.set(80, 200, -800);
  scene.add(moon);

  // gui.add(moon.position, "x").min(-300).max(300).step(1);
  // gui.add(moon.position, "y").min(-300).max(300).step(1);
  // gui.add(moon.position, "z").min(-600).max(300).step(1);
  // gui.add(model.scene.rotation, "x").name("lotationX").min(-1).max(1).step(0.1);
  // gui.add(model.scene.rotation, "y").name("lotationY").min(-1).max(1).step(0.1);
  // gui.add(model.scene.rotation, "z").name("lotationZ").min(-1).max(1).step(0.1);

  // 環境光源 (光源が無いとモデルが真っ黒になるので必要)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

  // 平行光源 (太陽を模した光源。この光源が無いと、のっぺりしてしまう)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 0);

  scene.add(model.scene);      // 読み込んだGLTFモデルをシーンに追加
  scene.add(ambientLight);     // 環境光源をシーンに追加
  scene.add(directionalLight); // 並行光源をシーンに追加

  // カメラを追加
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  //camera.position.set(0.5, 0, 300);
  camera.position.z = 2;
  camera.lookAt(model.scene);

  // レンダラーを追加
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;
  //renderer.render(scene, camera);

  const controls = new OrbitControls(camera, document.body);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;

  const animate = () => {
    renderer.render(scene, camera);

    //model.scene.rotation.x += 0.01;
    //model.scene.rotation.y += 0.01;
    //model.scene.rotation.z += 0.01;
    window.requestAnimationFrame(animate);
    const clockData = clock.getDelta();
    //Animation Mixerを実行
    if (mixer) {
      mixer.update(clockData);
    }
    for (let i = 0; i < length; i++) {
      // ジオメトリを下から上に動かす
      plane[i].position.x += (random(-5, 5) * 0);
      plane[i].position.y -= 100 * clockData;
      if (plane[i].position.y < -window.innerHeight) {
        // ジオメトリの位置がウィンドウの高さより大きくなったら初期位置に戻す
        plane[i].position.x = window.innerWidth * (Math.random() - 0.5);
        plane[i].position.y += window.innerHeight * 1.2;
      }
    }
    moon.rotation.x += clockData * 0.5;
    moon.rotation.y += clockData * 0.5;
  }
  animate();


  //ブラウザリサイズ操作
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  })
}

init();