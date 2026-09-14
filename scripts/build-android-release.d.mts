export interface AndroidReleaseBuildMetadataInput {
  androidVersionCode: number;
  gitStatus: string;
  headCommit: string;
  packageVersion: string;
  tagCommit: string | null;
}

export interface AndroidReleaseBuildMetadata {
  androidVersionCode: number;
  buildId: string;
  tagName: string;
  version: string;
}

export function resolveAndroidReleaseBuildMetadata(input: AndroidReleaseBuildMetadataInput): AndroidReleaseBuildMetadata;
export function runAndroidReleaseBuild(): void;
