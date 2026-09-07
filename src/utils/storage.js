/**
 * JSON File Storage Utility
 * Provides read/write operations for JSON data files
 * Used for storing users, subscribers, and contact submissions
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || './data';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`✅ Created data directory: ${DATA_DIR}`);
}

/**
 * Read JSON file safely
 * @param {string} filename - Name of file (e.g., 'users.json')
 * @returns {Array|Object} Parsed JSON data or empty array/object
 */
function readFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`📝 File doesn't exist, creating: ${filename}`);
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error.message);
    return [];
  }
}

/**
 * Write JSON file safely
 * @param {string} filename - Name of file
 * @param {Array|Object} data - Data to write
 * @returns {boolean} Success status
 */
function writeFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf-8');
    console.log(`✅ File saved: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error writing file ${filename}:`, error.message);
    return false;
  }
}

/**
 * Append a new item to a JSON array file
 * @param {string} filename - Name of file
 * @param {Object} item - Item to append
 * @returns {boolean} Success status
 */
function appendToFile(filename, item) {
  try {
    const data = readFile(filename);
    data.push(item);
    return writeFile(filename, data);
  } catch (error) {
    console.error(`Error appending to file ${filename}:`, error.message);
    return false;
  }
}

/**
 * Find item in JSON array file
 * @param {string} filename - Name of file
 * @param {Function} predicate - Comparison function
 * @returns {Object|null} Found item or null
 */
function findInFile(filename, predicate) {
  try {
    const data = readFile(filename);
    return data.find(predicate) || null;
  } catch (error) {
    console.error(`Error finding in file ${filename}:`, error.message);
    return null;
  }
}

/**
 * Filter items from JSON array file
 * @param {string} filename - Name of file
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered items
 */
function filterFile(filename, predicate) {
  try {
    const data = readFile(filename);
    return data.filter(predicate);
  } catch (error) {
    console.error(`Error filtering file ${filename}:`, error.message);
    return [];
  }
}

/**
 * Update item in JSON array file
 * @param {string} filename - Name of file
 * @param {Function} predicate - Find function
 * @param {Object} updates - Updated fields
 * @returns {boolean} Success status
 */
function updateInFile(filename, predicate, updates) {
  try {
    const data = readFile(filename);
    const index = data.findIndex(predicate);
    
    if (index === -1) return false;
    
    data[index] = { ...data[index], ...updates };
    return writeFile(filename, data);
  } catch (error) {
    console.error(`Error updating file ${filename}:`, error.message);
    return false;
  }
}

/**
 * Delete item from JSON array file
 * @param {string} filename - Name of file
 * @param {Function} predicate - Find function
 * @returns {boolean} Success status
 */
function deleteFromFile(filename, predicate) {
  try {
    const data = readFile(filename);
    const filtered = data.filter((item) => !predicate(item));
    return writeFile(filename, filtered);
  } catch (error) {
    console.error(`Error deleting from file ${filename}:`, error.message);
    return false;
  }
}

module.exports = {
  readFile,
  writeFile,
  appendToFile,
  findInFile,
  filterFile,
  updateInFile,
  deleteFromFile
};
