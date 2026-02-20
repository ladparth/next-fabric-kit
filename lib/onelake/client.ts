const MB = 1024 * 1024;
const GB = 1024 * MB;

export type OneLakeUploadTransferOptions = {
  blockSize: number;
  concurrency: number;
  maxSingleShotSize: number;
};

/** Tuning for browser → OneLake block uploads based on file size and hardware. */
export function getOneLakeUploadTransferOptions(
  fileSizeBytes: number,
  hardwareConcurrency?: number,
): OneLakeUploadTransferOptions {
  const normalizedSize = Number.isFinite(fileSizeBytes)
    ? Math.max(0, fileSizeBytes)
    : 0;
  const normalizedCores = Number.isFinite(hardwareConcurrency)
    ? Math.max(1, Math.floor(hardwareConcurrency!))
    : 8;

  const blockSize =
    normalizedSize >= 20 * GB
      ? 32 * MB
      : normalizedSize >= 5 * GB
        ? 16 * MB
        : normalizedSize >= 1 * GB
          ? 8 * MB
          : 4 * MB;

  const concurrency = Math.max(
    2,
    Math.min(12, Math.floor(normalizedCores / 2)),
  );

  return {
    blockSize,
    concurrency,
    maxSingleShotSize: 32 * MB,
  };
}
