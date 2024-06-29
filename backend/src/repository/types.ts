export type RepoData = {
  size: {
    total: number;
    lfs: LFS[];
  };
  readme?: string;
};

export type LFS = { filePath: string; size: number };
