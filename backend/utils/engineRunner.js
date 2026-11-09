import { spawn } from "node:child_process";

export const runEngine = (input) => {
  return new Promise((resolve, reject) => {
    const child = spawn("./engine/engine.exe");

    child.on("error", (error) => {
      reject(error);
    });

    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`C++ process failed with code ${code}`));
      }

      if (!output.trim()) {
        return reject(new Error("C++ returned empty output"));
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        return reject(error);
      }
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
};
