#!/usr/bin/env node

import { existsSync } from "fs";
import { buildCMSData } from "./lib/build";
import { lnfo, lwarn } from "./lib/utils/logger";
import { pathResolve } from "./lib/utils/utilities";


export function build(rootPath: string, destPath: string, done = () => void(0) as void) {
  buildCMSData(validatePaths(rootPath, destPath), done);
}

if (process.argv.length > 2) {
  if (process.argv[1].includes('gulp')) {
    lnfo('[INFO]', 'Running CMS builder in script mode');
  }
  else if (process.argv[2] == '-s') {
    runAsCmdLine();
  } else {
    lwarn('ERROR', 'To run script on cmd line, you need to include "-s" flag');
    process.exit(1);
  }
}


function runAsCmdLine() {
  const [,,,rootPath, destPath] = process.argv;
  if (!rootPath || !destPath) {
    throw Error('Missing either the root path or destination path argument');
  }
  buildCMSData(validatePaths(rootPath, destPath), () => void(0));
}

function validatePaths(rootPath: string, destPath: string) {
  const validRootPath = pathResolve(rootPath);
  const validDestPath = pathResolve(destPath);

  if (!existsSync(rootPath)) {
    throw Error(`Path: "${validRootPath}" does not exist`);
  }
  if (!destPath.includes(rootPath)) {
    throw Error(`Root path does not intersect destination path: \nRoot: "${validRootPath}"\nDest: "${validDestPath}"`);
  }

  return validDestPath;
}











