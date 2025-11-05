const sharp = require('sharp');
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');
const { statSync } = require('fs');

// --- Configuration ---
const SOURCE_DIR = 'media'; 
const DEST_DIR = '_site/img'; 
const SIZES = [500, 1000, 1500, 2000]; // Use the sizes from your template
const QUALITY = {
  jpeg: 80,
  png: 80,
};
// ---------------------

/**
 * The "Worker" function.
 * Processes a single image file.
 * Returns { width: 1234 } on success, null on failure.
 */
const processImage = async (filePath) => {
  try {
    const { name, dir, ext } = path.parse(filePath);
    const extension = ext.toLowerCase();
    const subDir = path.relative(SOURCE_DIR, dir);
    const outputDir = path.join(DEST_DIR, subDir);
    fs.ensureDirSync(outputDir);

    const image = sharp(filePath);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;
    
    console.log(`Processing: ${filePath} (Original: ${originalWidth}w)`);

    // --- Generate smaller, resized images ---
    for (const size of SIZES) {
      if (size < originalWidth) {
        const newFileName = `${name}-${size}w${ext}`;
        const outputPath = path.join(outputDir, newFileName);
        const processor = image.clone().resize(size);
        if (extension === '.jpg' || extension === '.jpeg') {
          await processor.jpeg({ quality: QUALITY.jpeg }).toFile(outputPath);
        } else if (extension === '.png') {
          await processor.png({ quality: QUALITY.png }).toFile(outputPath);
        }
      }
    }

    // --- Save an optimized version of the original, largest size ---
    const originalSizeFileName = `${name}${ext}`; 
    const originalOutputPath = path.join(outputDir, originalSizeFileName);
    if (extension === '.jpg' || extension === '.jpeg') {
      await image.clone().jpeg({ quality: QUALITY.jpeg }).toFile(originalOutputPath);
    } else if (extension === '.png') {
      await image.clone().png({ quality: QUALITY.png }).toFile(originalOutputPath);
    }
    
    // --- MODIFIED: Return the width ---
    return { width: originalWidth }; 
  } catch (error) {
    console.error(`--- ERROR processing ${filePath} ---`);
    console.error(error.message);
    console.warn(`Skipping this file due to error.`);
    console.error(`-----------------------------------`);
    // --- MODIFIED: Return null ---
    return null; 
  }
};

/**
 * The "Manager" function.
 * Finds all images, checks for caching, and assigns work.
 */
const run = async () => {
  const files = glob.sync(`${SOURCE_DIR}/**/*.{jpg,jpeg,png}`);
  
  if (files.length === 0) {
    console.log("No images found to process.");
    return;
  }

  console.log(`Found ${files.length} total images. Checking for new/updated...`);
  fs.ensureDirSync(DEST_DIR);

  let tasksToRun = []; // Holds the promises for processing
  let fileMap = []; // Holds metadata to build the manifest

  let skippedCount = 0;

  for (const filePath of files) {
    const { name, dir, ext } = path.parse(filePath);
    const subDir = path.relative(SOURCE_DIR, dir);
    const outputDir = path.join(DEST_DIR, subDir);

    let metadata;
    try {
      metadata = await sharp(filePath).metadata();
    } catch (error) {
      console.error(`--- ERROR reading metadata for ${filePath} ---`);
      console.error(error.message);
      console.warn(`Skipping this file entirely.`);
      console.error(`-----------------------------------`);
      continue; 
    }
    
    const receiptFileName = `${name}${ext}`; 
    const receiptPath = path.join(outputDir, receiptFileName);
    let shouldProcess = true;

    try {
      const sourceStats = statSync(filePath);
      const receiptStats = statSync(receiptPath);
      if (sourceStats.mtime <= receiptStats.mtime) {
        shouldProcess = false;
      }
    } catch (error) {
      shouldProcess = true;
    }
    
    // We need the key as the template will see it (e.g., /media/image.jpg)
    const templatePath = '/' + filePath.replace(/\\/g, '/');
    fileMap.push({ templatePath, width: metadata.width, shouldProcess });

    if (shouldProcess) {
      tasksToRun.push(processImage(filePath)); 
    } else {
      skippedCount++;
    }
  }

  // --- Run tasks and build the manifest ---
  const processingCount = tasksToRun.length;
  console.log(`Skipping ${skippedCount} up-to-date images.`);
  console.log(`Attempting to process ${processingCount} new or updated images...`);

  await Promise.all(tasksToRun);
  
  // --- NEW: Create the manifest ---
  const manifest = {};
  for (const file of fileMap) {
    // Add all images to the manifest, even skipped ones
    manifest[file.templatePath] = {
      width: file.width
    };
  }

  try {
    fs.ensureDirSync('_data');
    fs.writeJsonSync('_data/images.json', manifest, { spaces: 2 });
    console.log('Successfully wrote images.json manifest.');
  } catch (err) {
    console.error('ERROR writing images.json manifest:', err);
  }

  console.log("Image processing complete.");
};

// --- Run the script ---
run().catch(console.error);