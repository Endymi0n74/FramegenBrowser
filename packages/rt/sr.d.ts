import type { ConvTune, GpuTimingResult } from './index.js';

export interface CreateSROptions {
  /** Raw TinySR weights blob (the released rt_sr.bin file). */
  weightsBin: ArrayBuffer;
  /** TinySR weights manifest (the released rt_sr.json file, parsed). */
  weightsManifest: Record<string, { offset: number; shape: number[] }>;
  /** Override the channel width inferred from the weights manifest. */
  channels?: number;
  /** Kernel tune from tuneConvRB; omit for safe defaults. */
  convTune?: ConvTune | null;
}

export interface SRTimedProcessResult {
  /** GPU duration in milliseconds, or null when no timing slot is available. */
  timing: GpuTimingResult;
}

export interface SR {
  /**
   * Submit one TinySR pass. False means the pipelines for this size are still
   * compiling and the caller should present the source texture instead.
   */
  process(srcTex: GPUTexture, dstTex: GPUTexture, w: number, h: number): boolean;
  /**
   * Submit one TinySR pass and request a non-blocking GPU timestamp sample.
   * Null means the pipelines for this size are still compiling.
   */
  processTimed(
    srcTex: GPUTexture,
    dstTex: GPUTexture,
    w: number,
    h: number,
  ): SRTimedProcessResult | null;
  /** Release every buffer owned by the TinySR runtime. */
  destroy(): void;
  /** Whether bounded production-path GPU timestamp sampling is available. */
  readonly hasGpuTimestamps: boolean;
  /** Upscale factor inferred from the output weights. */
  readonly scale: number;
}

export function createSR(device: GPUDevice, opts: CreateSROptions): Promise<SR>;
