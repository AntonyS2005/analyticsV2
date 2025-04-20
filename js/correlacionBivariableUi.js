import { readExcel } from "./correlacionBivariable.js";

document.getElementById("excelFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const { x, y } = readExcel(buffer);
  console.log("X:", x);
  console.log("Y:", y);
});
