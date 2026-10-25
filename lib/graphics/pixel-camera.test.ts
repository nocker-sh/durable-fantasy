import * as THREE from "three";
import { expect, it, vi } from "vitest";
import { PixelCamera } from "./pixel-camera.ts";

it("keeps the pixel scale and projection consistent when resizing and zooming", () => {
  const resize = vi.fn();
  const camera = new PixelCamera(new THREE.Vector3(2, 3, 4), 48, resize);
  camera.resize(800, 600);
  const distance = camera.distance;
  expect(resize).toHaveBeenLastCalledWith(800, 600, 1);
  expect(camera.camera.aspect).toBeCloseTo(800 / 600);
  camera.zoom(1);
  expect(resize).toHaveBeenLastCalledWith(800, 600, 2);
  expect(camera.distance).toBeCloseTo(distance / 2);
  expect(camera.zoomLevel()).toEqual({ level: 1, max: 1 });
  camera.zoom(1);
  expect(camera.zoomLevel().level).toBe(1);
});

it("holds the central region still and follows a turn around the same focus", () => {
  const camera = new PixelCamera(new THREE.Vector3(0, 0, 0), 48, () => {});
  camera.resize(800, 600);
  camera.update(new THREE.Vector3(0, 0, 0), 0, false, 1 / 60);
  expect(camera.focus.toArray()).toEqual([0, 0, 0]);
  camera.update(new THREE.Vector3(0, 0, 0), Math.PI / 2, true, 1 / 60);
  expect(camera.focus.toArray()).toEqual([0, 0, 0]);
  expect(camera.camera.position.x).toBeGreaterThan(0);
  expect(camera.camera.position.z).toBeCloseTo(0);
});
