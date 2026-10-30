import * as THREE from "three"
import { boardTex } from "#/world/scene/helpers/dressing/board-tex"

export const openMat = () => new THREE.MeshLambertMaterial({ map: boardTex("営業中", "#1e1410", "#d8c088"), side: THREE.DoubleSide })
