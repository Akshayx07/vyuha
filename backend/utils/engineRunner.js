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

    let timeout;

    child.on("close", (code) => {
      clearTimeout(timeout);
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

    timeout = setTimeout(() => {
      child.kill();
      return reject(new Error("C++ process timed out"));
    }, 5000);

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
};
