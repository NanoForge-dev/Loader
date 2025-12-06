export interface IManifestFile {
  path: string;
}

export interface IManifest {
  version: string;
  files: IManifestFile[];
}

export interface IExtendedManifestFile extends IManifestFile {
  localPath: string;
}

export interface IExtendedManifest {
  files: IExtendedManifestFile[];
}
