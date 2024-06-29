import { describe, expect, test } from "vitest";
import {
  getCountObjectsSizeInBytes,
  getFilePathFromLfsStdout,
  getFileSizeFromLfsStdout,
  getLfsFilesSizes,
} from "../size";

const REPO_FOLDER_NAME = "albert-albert-base-v1_tmp";
const REPO_GIT_COUNT_OBJECTS_SIZE_BYTES = 1732608;

describe("size.ts", () => {
  describe("getLfsFilesSizes()", async () => {
    test("get correct sizes of LFS files in repo", async () => {
      expect(
        await getLfsFilesSizes(`${__dirname}/${REPO_FOLDER_NAME}`)
      ).toStrictEqual([
        {
          filePath: "flax_model.msgpack",
          size: 6657199309,
        },
        {
          filePath: "model.fp32-00001-of-00002.safetensors",
          size: 5368709120,
        },
        {
          filePath: "model.fp32-00002-of-00002.safetensors",
          size: 1288490189,
        },
        {
          filePath: "model.safetensors",
          size: 3328599654,
        },
        {
          filePath: "pytorch_model.bin",
          size: 3328599654,
        },
        {
          filePath: "pytorch_model.fp32-00001-of-00002.bin",
          size: 5368709120,
        },
        {
          filePath: "pytorch_model.fp32-00002-of-00002.bin",
          size: 1288490189,
        },
      ]);
    });
  });

  describe("getCountObjectsSizeInBytes()", async () => {
    test("get correct git count-objects size-pack value in repo", async () => {
      expect(
        await getCountObjectsSizeInBytes(`${__dirname}/${REPO_FOLDER_NAME}`)
      ).toBe(REPO_GIT_COUNT_OBJECTS_SIZE_BYTES);
    });
  });

  describe("getFileSizeFromLfsStdout()", async () => {
    test.each([
      ["e9c7b74594 - flax_model.msgpack (6.2 GB)", "6.2 GB"],
      ["e9c7b74594 - flax_model.msgpack (0 GB)", "0 GB"],
      ["e9c7b74594 .msgpack (6.2 GB)", "6.2 GB"],
      ["e9c7b74594 - flax_model.msgpack (2.0 GB) (6.2 GB)", "6.2 GB"],
      ["e9c7b74594 - flax_model.msgpack )6.2 GB(", null],
      ["e9c7b74594 - flax_model.msgpack 6.2 GB", null],
    ])("input '%s' -> '%s'", (input, expected) => {
      expect(getFileSizeFromLfsStdout(input)).toBe(expected);
    });
  });

  describe("getFilePathFromLfsStdout()", async () => {
    test.each([
      ["e9c7b74594 - flax_model.msgpack (6.2 GB)", "flax_model.msgpack"],
      [
        "e9c7b74594 - folder/flax_model.msgpack (6.2 GB)",
        "folder/flax_model.msgpack",
      ],
      ["e9c7b74594flax_model.msgpack 6.2 GB", null],
      ["e9c7b74594 flax_model.msgpack (6.2 GB)", null],
    ])("input '%s' -> '%s'", (input, expected) => {
      expect(getFilePathFromLfsStdout(input)).toBe(expected);
    });
  });
});
