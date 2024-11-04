const { Function: BaseFunction, Code } = require('aws-cdk-lib/aws-lambda');
const { mkdirSync, existsSync, copyFileSync, readFileSync, rmSync, cpSync } = require('node:fs');
class Function extends BaseFunction {
    static libDir;
    static buildDir;
    constructor(scope, id, props) {

        console.log(props.code.path);
        Function.libDir = props.code.path;
        Function.buildDir = Function.libDir + "/build";
        let [fileName, functionName] = props.handler.split(".");
        let packageName = fileName.replaceAll("/", "-");
        let packagePath = Function.buildDir + "/" + packageName;
        let directoryCreate = mkdirSync(packagePath, { recursive: true });
        //console.log('directoryCreate', directoryCreate);
        //console.log("packageName:", packageName);
        rmSync(packagePath, { recursive: true });
        Function.createAllDependencyFiles(packagePath, props.code.path, fileName + ".mjs");
        props.code = Code.fromAsset(packagePath);
        if (props.includeAdditionalDirectories) {

            props.includeAdditionalDirectories.forEach(directory => {
                mkdirSync(packagePath + "/" + directory, { recursive: true });
                //console.log("create directory", packagePath+ "/" + directory);
                cpSync(Function.libDir + "/" + directory, packagePath + "/" + directory, { recursive: true });
            });

            delete props.includeAdditionalDirectories;
        }
        if (props.includeAdditionalFiles) {
            props.includeAdditionalFiles.forEach(file => {
                let splitFile = file.split("/");
                splitFile.pop();
                mkdirSync(Function.buildDir + "/" + splitFile.join("/"), { recursive: true });
                cpSync(Function.libDir + "/" + file, Function.buildDir + "/" + file, { recursive: true });
            });
            delete props.includeAdditionalFiles;
        }
        super(scope, id, props);
    }
    static createDependenciesForTheImport = (packagePath, currentDir, importedFile) => {
        if (existsSync(currentDir + "/" + importedFile)) {
            let tempBaseDir = currentDir.trim().replace(/\/$/, '').split("/");
            let file = [];
            importedFile.split("/").forEach((val) => {
                if (val == '.') {
                    //pass
                }
                else if (val === '..') {
                    tempBaseDir.pop();
                }
                else {
                    file.push(val);
                }
            });
            this.createAllDependencyFiles(packagePath, tempBaseDir.join("/"), file.join("/"));
        }

    }
    static createAllDependencyFiles = (packagePath, baseDir, fileName) => {
        //console.log(`createAllDependencyFiles`, packagePath, baseDir, fileName);
        let lambdaDir = Function.libDir;
        let currentDir = baseDir + "/" + fileName.split("/").slice(0, -1).join("/");
        if (existsSync(baseDir.replace(lambdaDir, packagePath) + "/" + fileName)) {
            //console.log("file already created", baseDir.replace(lambdaDir, packagePath) + "/" + fileName);
            return true;
        }
        mkdirSync(currentDir.replace(lambdaDir, packagePath), { recursive: true });
        copyFileSync(baseDir + "/" + fileName, baseDir.replace(lambdaDir, packagePath) + "/" + fileName);
        let fileData = readFileSync(baseDir + "/" + fileName, { encoding: 'utf8', flag: 'r' });


        //const es6Pattern = /import\s+[^'"]*['"]([^'"]+)['"]/g;
        //const commonjsPattern = /require\(['"]([^'"]+)['"]\)/g;
        const es6Pattern = /import\s+(?:(?:[\w*\s{},]*\s+from\s+)?["']([^"']+)["']|["']([^"']+)["']);?/g;
        const commonjsPattern = /require\(['"]([^'"]+)['"]\);/g;

        //console.log(fileData);
        let importedFiles = [];
        let match;
        while ((match = es6Pattern.exec(fileData)) !== null) {
            importedFiles.push(match[1]);
            if (existsSync(currentDir + "/" + match[1])) {
                //console.log(`packagePath: ${packagePath}, currentDir: ${currentDir} , importedPackage: ${match[1]} `);
                this.createDependenciesForTheImport(packagePath, currentDir, match[1]);
            }
            else {
                //console.log(`unmatched packagePath: ${packagePath}, currentDir: ${currentDir} , importedPackage: ${match[1]} `);
            }
        }
        while ((match = commonjsPattern.exec(fileData)) !== null) {
            if (existsSync(match[1])) {
                //console.log(`packagePath: ${packagePath}, currentDir: ${currentDir} , importedPackage: ${match[1]} `);
                this.createDependenciesForTheImport(packagePath, currentDir, match[1]);
            }
            else {
                //console.log(`unmatched packagePath: ${packagePath}, currentDir: ${currentDir} , importedPackage: ${match[1]} `);
            }
        }

        //console.log(importedFiles);

    }
}
module.exports = Function;