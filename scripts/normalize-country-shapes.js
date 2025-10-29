import fs from 'fs';
import pathBounds from 'svg-path-bounds';
import baseShapes from "world-map-country-shapes";
import { customCountryShapes } from "../src/utils/customCountryShapes.js";

const shapeMap = {};
for (const shape of [...baseShapes, ...customCountryShapes]) {
  shapeMap[shape.id] = shape; // customCountryShapes will overwrite duplicates
}
const allShapes = Object.values(shapeMap);

// target box size (100x100)
const TARGET_SIZE = 100;

const normalized = allShapes.map(({ id, shape }) => {
    // Compute bounding box
    const [minX, minY, maxX, maxY] = pathBounds(shape);
    const width = maxX - minX;
    const height = maxY - minY;

    // Uniform scale to fit largest dimension in target box
    const scale = TARGET_SIZE / Math.max(width, height);

    // Calculate translation to move shape to origin first
    const translateX = -minX;
    const translateY = -minY;

    // Offset to center in 100x100 box
    const offsetX = (TARGET_SIZE - width * scale) / 2;
    const offsetY = (TARGET_SIZE - height * scale) / 2;

    // Store both original path and transform
    const transform = `translate(${offsetX},${offsetY}) scale(${scale}) translate(${translateX},${translateY})`;

    return { id, path: shape, transform };
});

// Write out normalized data
fs.writeFileSync(
    './src/utils/normalizedCountryShapes.json',
    JSON.stringify(normalized, null, 2)
);

console.log('✅ Normalized shapes saved to src/utils/normalizedCountryShapes.json');