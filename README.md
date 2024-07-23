# AWS CDK Lambda Optimize Node

This Node.js module for AWS CDK helps optimize Lambda functions by including only the files required by the handler function. This can help reduce the deployment package size and improve deployment times.

## Installation

To install this package, use npm:

```sh
npm install aws-cdk-lambda-optimize-node
```

## Usage

Below is an example of how to use this module in an AWS CDK project.

### Step 1: Import the Module

In your CDK stack, import the module and use it to create your optimized Lambda function.

```
const Function = require("awscdk-lambda-optimize-node");
```

### Step 2: Use it

Use it same as you were using aws-cdk lib function:

```
const { Code } = require('aws-cdk-lib/aws-lambda');
const Function = require("awscdk-lambda-optimize-node");

let checkAccountStatusLambda = new Function(this, 'LambdaFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      code: Code.fromAsset(path.join(__dirname, 'lambda'))
});

```

Add additional directory

```
const { Code } = require('aws-cdk-lib/aws-lambda');
const Function = require("awscdk-lambda-optimize-node");

let checkAccountStatusLambda = new Function(this, 'LambdaFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      code: Code.fromAsset(path.join(__dirname, 'lambda')),
      includeAdditionalDirectories: [
        "directorypath"
      ]
});

```

same as direactory if you want to include files then you can add it in includeAdditionalFiles props.

### Contributing

Contributions are welcome! Here are a few ways you can help:

- **Report Bugs:** If you encounter any bugs, please open an issue on GitHub with details about the problem.
- **Suggest Features:** Have an idea for a new feature? Open an issue to discuss it.
- **Submit Pull Requests:** If you want to contribute code, fork the repository and submit a pull request with your changes. Make sure to include tests for any new features or bug fixes.

### License

This project is licensed under the MIT License - see the LICENSE file for details.
