import * as THREE from "three";
import { WATER_Y, walkH, groundH, inRect, currentLayout } from "../world";
import { pines, stumps, mushrooms } from "../fields";
import { NODES } from "../../core/gather.ts";
import { STATIONS } from "../../town/stations.ts";
import { EXCHANGE_BOARD } from "../../town/boards.ts";
import { updaters, bush, type V2 } from "../build";

export function createGatheringSpots(town: THREE.Group, map: string) {
  const spots = new Map<string, { full: THREE.Group; spent: THREE.Group; at: V2 }>();
  for (const n of NODES) {
    if (n.map !== map) continue;
    const at: V2 = [(n.cell[0] + 0.5) / 2, (n.cell[1] + 0.5) / 2];
    const full = new THREE.Group(),
      spent = new THREE.Group();
    const one = (s = 1) => [{ x: at[0], z: at[1], s, r: n.cell[0] * 0.7 }];
    if (n.kind === "tree") {
      pines(full, one(1.2));
      stumps(spent, one(1));
    }
    if (n.kind === "herbs") bush(full, at[0], at[1], 0.3, "leaf2", false);
    if (n.kind === "flowers") bush(full, at[0], at[1], 0.3, "leaf", true);
    if (n.kind === "mushrooms") mushrooms(full, [...one(1.6), { x: at[0] + 0.3, z: at[1] + 0.2, s: 1.3, r: 2 }]);
    if (n.kind === "fish") {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.32, 16), new THREE.MeshBasicMaterial({ color: 0xd8e8f0, transparent: true, opacity: 0.6, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      // the spot is the bank you stand on; the ripples are out on the nearest open water
      let wet: V2 = at;
      for (let r = 0.5; r <= 2 && wet === at; r += 0.5)
        for (let k = 0; k < 8 && wet === at; k++) {
          const p: V2 = [at[0] + Math.cos((k * Math.PI) / 4) * r, at[1] + Math.sin((k * Math.PI) / 4) * r];
          if (!inRect(p[0], p[1], currentLayout().bridge, 0.8) && groundH(p[0], p[1]) < WATER_Y) wet = p;
        }
      ring.position.set(wet[0], WATER_Y + 0.02, wet[1]);
      full.add(ring);
      updaters.push((t) => {
        const k = (t * 0.6 + n.cell[0]) % 1;
        ring.scale.setScalar(0.6 + k * 1.6);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - k);
      });
    }
    full.userData.node = n.id;
    spent.visible = false;
    town.add(full, spent);
    spots.set(n.id, { full, spent, at });
  }
  // stations work like spots: an invisible box over the furniture to click, a soft glow to find it
  for (const s of [...STATIONS, { id: "exchange-board", map: EXCHANGE_BOARD.map, cell: EXCHANGE_BOARD.cell }]) {
    if (s.map !== map) continue;
    const at: V2 = [(s.cell[0] + 0.5) / 2, (s.cell[1] + 0.5) / 2];
    const full = new THREE.Group(),
      spent = new THREE.Group();
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 1.1), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(at[0], walkH(at[0], at[1]) + 0.7, at[1]);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.62, 20), new THREE.MeshBasicMaterial({ color: 0xf0d078, transparent: true, opacity: 0.5, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(at[0], walkH(at[0], at[1]) + 0.04, at[1]);
    full.add(hit, glow);
    full.userData.node = `station:${s.id}`;
    town.add(full, spent);
    spots.set(`station:${s.id}`, { full, spent, at });
  }
  function setNodes(left: Readonly<Record<string, number>>) {
    for (const [id, s] of spots) {
      if (id.startsWith("station:")) continue;
      const has = (left[id] ?? 1) > 0;
      s.full.visible = has;
      s.spent.visible = !has;
    }
  }
  const spotHit = (ray: THREE.Raycaster): string | null => {
    const hits = ray.intersectObjects(
      [...spots.values()].filter((s) => s.full.visible).map((s) => s.full),
      true,
    );
    let o: THREE.Object3D | null = hits[0]?.object ?? null;
    while (o && !o.userData.node) o = o.parent;
    return (o?.userData.node as string | undefined) ?? null;
  };

  return { spots, setNodes, spotHit };
}
