// Type stub for @mediapipe/tasks-vision
// This is overridden once the real package is installed.
declare module "@mediapipe/tasks-vision" {
  export class FilesetResolver {
    static forVisionTasks(wasmFileset: string): Promise<FilesetResolver>;
  }

  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
  }

  export interface FaceLandmarkerResult {
    faceLandmarks: NormalizedLandmark[][];
  }

  export class FaceLandmarker {
    static createFromOptions(
      wasmFileset: FilesetResolver,
      options: {
        baseOptions: {
          modelAssetPath: string;
          delegate?: "GPU" | "CPU";
        };
        runningMode?: "IMAGE" | "VIDEO";
        numFaces?: number;
        outputFaceBlendshapes?: boolean;
        outputFacialTransformationMatrixes?: boolean;
      }
    ): Promise<FaceLandmarker>;

    detectForVideo(
      video: HTMLVideoElement,
      timestampMs: number
    ): FaceLandmarkerResult;

    close(): void;
  }
}
