// const fs = require('fs');
// const path = require('path');

// // Adjust paths to your environment and service files
// const environmentFilePath = '../src/environments/environment.ts';
// const projectDirectory = '../src/app';

// // Read the environment.ts file to get the base URL
// function getBaseUrl() {
//   const environmentContent = fs.readFileSync(environmentFilePath, 'utf8');
//   const baseUrlMatch = environmentContent.match(/baseUrl\s*:\s*['"`](https?:\/\/[^'"`]+)['"`]/);
//   if (baseUrlMatch) {
//     return baseUrlMatch[1];
//   }
//   return null;
// }

// // List of common HttpService methods that are used in your service
// const serviceMethods = ['getReq', 'postReq', 'putReq', 'deleteReq', 'patchReq'];

// // Function to read files recursively in a directory
// function readFilesRecursively(directory) {
//   const fileList = [];

//   function recursiveRead(dir) {
//     const files = fs.readdirSync(dir);

//     files.forEach((file) => {
//       const fullPath = path.join(dir, file);
//       const stat = fs.statSync(fullPath);

//       if (stat.isDirectory()) {
//         recursiveRead(fullPath);
//       } else if (file.endsWith('.ts')) {
//         fileList.push(fullPath);
//       }
//     });
//   }

//   recursiveRead(directory);
//   return fileList;
// }

// // Function to extract dynamic API calls from a TypeScript file
// function extractApisFromFile(filePath, baseUrl) {
//   const fileContent = fs.readFileSync(filePath, 'utf8');
//   const lines = fileContent.split('\n');

//   const apis = [];

//   lines.forEach((line, index) => {
//     // Look for HttpService method usage (e.g., this.httpService.getReq, postReq, etc.)
//     serviceMethods.forEach((method) => {
//       if (line.includes(`.${method}(`)) {
//         // Extract the dynamic path passed to the service methods
//         const pathMatch = line.match(/\(['"`]([^'"`]+)['"`]/);
//         if (pathMatch) {
//           apis.push({
//             method: method.replace('Req', '').toUpperCase(), // Extract the HTTP method (GET, POST, etc.)
//             url: `${baseUrl}${pathMatch[1]}`,
//             lineNumber: index + 1,
//           });
//         }
//       }
//     });
//   });

//   return apis;
// }

// // Main function to scan the project and list all APIs
// function listAllApis() {
//   const baseUrl = getBaseUrl();
//   if (!baseUrl) {
//     console.error('Base URL not found in environment.ts');
//     return;
//   }

//   console.log(`Base URL: ${baseUrl}`);

//   const files = readFilesRecursively(projectDirectory);
//   const allApis = [];

//   files.forEach((file) => {
//     const apis = extractApisFromFile(file, baseUrl);
//     if (apis.length > 0) {
//       allApis.push({ file, apis });
//     }
//   });

//   // Output the list of APIs
//   console.log('List of APIs used in the project:');
//   allApis.forEach((apiFile) => {
//     console.log(`\nFile: ${apiFile.file}`);
//     apiFile.apis.forEach((api) => {
//       console.log(`  ${api.method} - ${api.url} (Line ${api.lineNumber})`);
//     });
//   });
// }

// // Run the API extraction
// listAllApis();


const fs = require('fs');
const path = require('path');

// Adjust the directory paths
const projectDirectory = '../src/app';
const htmlFileExtension = '.html';
const tsFileExtension = '.ts';

// List of common HttpService methods that are used in your service (replace with your service method names)
const serviceMethods = ['getReq', 'postReq', 'putReq', 'deleteReq', 'patchReq'];

// Function to read files recursively in a directory
function readFilesRecursively(directory) {
  const fileList = [];

  function recursiveRead(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        recursiveRead(fullPath);
      } else if (file.endsWith(tsFileExtension) || file.endsWith(htmlFileExtension)) {
        fileList.push(fullPath);
      }
    });
  }

  recursiveRead(directory);
  return fileList;
}

// Function to extract API calls and response keys from a TypeScript file
function extractApisAndResponseKeysFromFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');

  const apis = [];
  let currentApi = null;

  lines.forEach((line, index) => {
    // Look for HttpService method usage (e.g., this.httpService.getReq, postReq, etc.)
    serviceMethods.forEach((method) => {
      if (line.includes(`.${method}(`)) {
        const pathMatch = line.match(/\(['"`]([^'"`]+)['"`]/); // Extract path if present
        currentApi = {
          method: method.replace('Req', '').toUpperCase(),
          path: pathMatch ? pathMatch[1] : 'Unknown',
          lineNumber: index + 1,
          responseKeys: [],
          filePath: filePath,
        };
        apis.push(currentApi);
      }
    });

    // If we're inside an API call block, capture response keys from res or response objects
    if (currentApi) {
      const responseKeys = extractResponseKeys(line);
      if (responseKeys.length > 0) {
        currentApi.responseKeys.push(...responseKeys);
      }
    }
  });

  return apis;
}

// Function to extract keys from the response object (like res.data.key) in TypeScript files
function extractResponseKeys(content) {
  const responseKeys = [];
  const responsePattern = /(res|data|response)\.([\w]+)/g;  // Detects res.key, data.key, response.key

  // Search for response key patterns in the content
  let match;
  while ((match = responsePattern.exec(content)) !== null) {
    const key = match[2]; // Extract the key after res. or data. or response.
    if (key && !responseKeys.includes(key)) {
      responseKeys.push(key);
    }
  }

  return responseKeys;
}

// Function to extract response keys from HTML templates (Angular syntax)
function extractResponseKeysFromHtml(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const htmlKeys = [];

  // Detect {{ res.key }}, *ngIf="res.key", or [src]="res.key"
  const htmlPattern = /{{\s*([\w\.]+)\s*}}|\*ngIf\s*=\s*"([\w\.]+)"|\[([\w\.]+)\]/g;

  let match;
  while ((match = htmlPattern.exec(fileContent)) !== null) {
    const key = match[1] || match[2] || match[3];
    if (key && !htmlKeys.includes(key)) {
      const parts = key.split('.'); // Detect keys like res.data.key -> ['res', 'data', 'key']
      if (parts.length > 1) {
        htmlKeys.push(parts[parts.length - 1]); // Only add the final key, e.g., 'key'
      }
    }
  }

  return htmlKeys;
}

// Function to link HTML templates with their corresponding component (.ts) file
function getHtmlFileForComponent(tsFilePath) {
  const componentName = path.basename(tsFilePath).replace('.ts', '');
  const directory = path.dirname(tsFilePath);
  const htmlFilePath = path.join(directory, `${componentName}.html`);

  if (fs.existsSync(htmlFilePath)) {
    return htmlFilePath;
  }
  return null;
}

// Main function to scan the project and list all APIs and their response keys (in both .ts and .html)
function listAllApisAndResponseKeys() {
  const files = readFilesRecursively(projectDirectory);
  const allApis = [];

  files.forEach((file) => {
    if (file.endsWith(tsFileExtension)) {
      const apis = extractApisAndResponseKeysFromFile(file);
      if (apis.length > 0) {
        apis.forEach((api) => {
          // Check if there is an associated HTML file for this component
          const htmlFile = getHtmlFileForComponent(file);
          if (htmlFile) {
            const htmlKeys = extractResponseKeysFromHtml(htmlFile);
            if (htmlKeys.length > 0) {
              api.responseKeys.push(...htmlKeys);
            }
          }
        });
        allApis.push({ file, apis });
      }
    }
  });

  // Output the list of APIs and their response keys (from both .ts and .html)
  console.log('List of APIs and Response Keys used in the project:');
  allApis.forEach((apiFile) => {
    console.log(`\nFile: ${apiFile.file}`);
    apiFile.apis.forEach((api) => {
      console.log(`  ${api.method} - ${api.path} (Line ${api.lineNumber})`);
      console.log(`    Response Keys: ${[...new Set(api.responseKeys)].join(', ')}`); // Remove duplicates
    });
  });
}

// Run the API and response key extraction
listAllApisAndResponseKeys();
