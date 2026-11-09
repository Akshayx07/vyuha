import { runEngine } from "./utils/engineRunner.js";

const result = await runEngine({
  number: 10,
  operation: "square",
});

console.log(result);
