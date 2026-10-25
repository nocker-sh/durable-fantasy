// Renders villager sprite frames off the main thread, one frame per message. The frame goes back
// as an ImageBitmap (transferred) with a PNG of it for the page to keep in IndexedDB.
import { ANIMS, FH, FW, renderFrame, type AnimSpec, type Anim, type Item, type Look } from "./figure";
import { PixBuf } from "./pix";

export interface FrameJob {
  key: string;
  look: Look;
  anim: string;
  spec: AnimSpec;
  item: Item;
  view: number;
  f: number;
}
export interface FrameDone {
  key: string;
  bitmap: ImageBitmap;
  png: Blob;
}

const canvas = new OffscreenCanvas(FW, FH);
const ctx = canvas.getContext("2d")!;

self.onmessage = async (event: MessageEvent<FrameJob>) => {
  const job = event.data;
  // clips registered on the main thread (studio motions) are not in this copy of ANIMS yet
  ANIMS[job.anim as Anim] ??= job.spec;
  const buf = new PixBuf(FW, FH);
  renderFrame(job.look, job.anim as Anim, job.f, job.view, job.item, buf, 0, 0);
  ctx.clearRect(0, 0, FW, FH);
  ctx.putImageData(new ImageData(buf.data, FW, FH), 0, 0);
  const png = await canvas.convertToBlob({ type: "image/png" });
  const bitmap = canvas.transferToImageBitmap();
  const done: FrameDone = { key: job.key, bitmap, png };
  (self as unknown as Worker).postMessage(done, [bitmap]);
};
