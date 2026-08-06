/**
 * 3D data-network background (Three.js)
 * Amber node constellation — subtle, recruiter-friendly, mobile-aware
 */
(function () {
  "use strict";

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var container = document.getElementById("bg3d");
  if (!container || typeof THREE === "undefined") return;

  var isMobile = window.innerWidth < 768;
  var NODE_COUNT = isMobile ? 48 : 110;
  var LINK_DIST = isMobile ? 95 : 120;
  var mouseX = 0;
  var mouseY = 0;
  var targetRotX = 0;
  var targetRotY = 0;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 420;

  var renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    powerPreference: "low-power"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  var group = new THREE.Group();
  scene.add(group);

  var positions = new Float32Array(NODE_COUNT * 3);
  var velocities = [];
  var spread = isMobile ? 280 : 380;

  for (var i = 0; i < NODE_COUNT; i++) {
    var ix = i * 3;
    positions[ix] = (Math.random() - 0.5) * spread * 2;
    positions[ix + 1] = (Math.random() - 0.5) * spread * 1.4;
    positions[ix + 2] = (Math.random() - 0.5) * spread * 1.6;
    velocities.push({
      x: (Math.random() - 0.5) * 0.18,
      y: (Math.random() - 0.5) * 0.18,
      z: (Math.random() - 0.5) * 0.18
    });
  }

  var pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  var pointsMat = new THREE.PointsMaterial({
    color: 0xffbd39,
    size: isMobile ? 2.4 : 2.8,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false
  });

  var points = new THREE.Points(pointsGeo, pointsMat);
  group.add(points);

  // Soft larger glow points
  var glowMat = new THREE.PointsMaterial({
    color: 0xffbd39,
    size: isMobile ? 6 : 8,
    transparent: true,
    opacity: 0.18,
    sizeAttenuation: true,
    depthWrite: false
  });
  var glow = new THREE.Points(pointsGeo, glowMat);
  group.add(glow);

  var maxLinks = isMobile ? 80 : 220;
  var linePositions = new Float32Array(maxLinks * 6);
  var linesGeo = new THREE.BufferGeometry();
  linesGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );
  var linesMat = new THREE.LineBasicMaterial({
    color: 0xffbd39,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });
  var lines = new THREE.LineSegments(linesGeo, linesMat);
  group.add(lines);

  function updateLinks() {
    var linkCount = 0;
    var pos = pointsGeo.attributes.position.array;

    for (var a = 0; a < NODE_COUNT && linkCount < maxLinks; a++) {
      for (var b = a + 1; b < NODE_COUNT && linkCount < maxLinks; b++) {
        var ax = pos[a * 3];
        var ay = pos[a * 3 + 1];
        var az = pos[a * 3 + 2];
        var bx = pos[b * 3];
        var by = pos[b * 3 + 1];
        var bz = pos[b * 3 + 2];
        var dx = ax - bx;
        var dy = ay - by;
        var dz = az - bz;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < LINK_DIST) {
          var li = linkCount * 6;
          linePositions[li] = ax;
          linePositions[li + 1] = ay;
          linePositions[li + 2] = az;
          linePositions[li + 3] = bx;
          linePositions[li + 4] = by;
          linePositions[li + 5] = bz;
          linkCount++;
        }
      }
    }

    // Zero unused
    for (var z = linkCount * 6; z < linePositions.length; z++) {
      linePositions[z] = 0;
    }
    linesGeo.attributes.position.needsUpdate = true;
    linesGeo.setDrawRange(0, linkCount * 2);
  }

  function onPointerMove(e) {
    var x = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0].clientX;
    var y = e.clientY !== undefined ? e.clientY : e.touches && e.touches[0].clientY;
    if (x == null) return;
    mouseX = (x / window.innerWidth) * 2 - 1;
    mouseY = (y / window.innerHeight) * 2 - 1;
  }

  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });

  function onResize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
  });

  var t = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    t += 0.004;
    var pos = pointsGeo.attributes.position.array;

    for (var i = 0; i < NODE_COUNT; i++) {
      var ix = i * 3;
      var v = velocities[i];
      pos[ix] += v.x;
      pos[ix + 1] += v.y + Math.sin(t + i) * 0.02;
      pos[ix + 2] += v.z;

      // Soft bounds bounce
      if (Math.abs(pos[ix]) > spread) v.x *= -1;
      if (Math.abs(pos[ix + 1]) > spread * 0.75) v.y *= -1;
      if (Math.abs(pos[ix + 2]) > spread * 0.85) v.z *= -1;
    }

    pointsGeo.attributes.position.needsUpdate = true;
    updateLinks();

    targetRotY = mouseX * 0.25;
    targetRotX = mouseY * 0.15;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
    group.rotation.z = Math.sin(t * 0.5) * 0.03;

    camera.position.x += (mouseX * 18 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 12 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  updateLinks();
  animate();
})();
