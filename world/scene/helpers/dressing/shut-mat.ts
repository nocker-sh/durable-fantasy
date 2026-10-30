import * as THREE from "three"
import { boardTex } from "#/world/scene/helpers/dressing/board-tex"

export const shutMat = () => new THREE.MeshLambertMaterial({ map: boardTex("準備中", "#d8d0c0", "#3a3034"), side: THREE.DoubleSide })
