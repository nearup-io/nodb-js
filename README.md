# Nodb JS/TS

Our service allows you to store and process unstructured JSON data in a unified database format. Our npm package ensures all data is transformed and stored both as JSON entities and their vector embedding representations, always in-sync.
The interface for processing JSON data is similar to standard CRUD operations, making it easy to integrate. When you send an unstructured JSON payload via a POST request, the data is seamlessly written to the Farspeak database. This integration allows you to query all your data using natural language immediately.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Key Concepts](#key-concepts)
4. [Usage](#usage)
5. [API Reference](#api-reference)

## Installation

Nodb supports both ESM and CommonJS modules, allowing you to integrate it seamlessly into your projects using either module system and you can use it with npm, yarn, bun, etc.

First install the NPM package (e.g. with npm, yarn, pnpm, bun):

```bash
npm install nodb-js
```

## Getting Started

To begin using NodbSDK, import the Nodb class:

```javascript
import Nodb from "nodb-js";
//OR
const Nodb = require("nodb");
```
If you're using import you should add "type": "module" to package.json.
You need to create an instance of Nodb now:
```javascript
const nodb = new Nodb({
  baseUrl: "localhost:3000",
});
```
### Creating Your First Application and Environment

To create your first application with an environment:

```javascript
const application = await nodb.createAppWithEnvironmentAndGetTokens({
  appName: "your-application-name",
  environmentName: "your-environment-name",
});
```

### Working with Tokens

After creating an application, you'll receive tokens for both the application and the environment:

```javascript
// Token for your application (broader permission scope)
const appToken = application.applicationTokens[0].key;

// Token for your environment (limited scope of permissions for the environment)
const envToken = application.environmentTokens[0].key;
```

### Setting Tokens

You can set a token globally for all subsequent operations:

```javascript
nodb.setToken(appToken);
```

Alternatively, you can provide tokens individually for each method call. If both a global token and a method-specific token are provided, the method-specific token takes precedence.

## Key Concepts

NodbSDK works with the following hierarchical structure:

- Application: The top-level container
- Environments: Belong to an application
- Entities: Belong to an environment

One application can contain multiple environments, and each environment can contain multiple entities.

## Getting started
Let's write our first entities. Prepare some data that you'll import:
```javascript
// seed.ts
type Todo = {
  task: string;
  priority?: "high" | "low";
  completed: boolean;
}

const todos:Todo[] = [
  {
    task: "Finish report",
    priority: "high",
    completed: false,
  },
  {
    task: "Buy groceries",
    completed: false,
  },
  {
    task: "Call mom",
    completed: false,
  },
];
```

Writing entities is done using writeEntities method for example using todos entity:
```javascript
const ids = await nodb.writeEntities({
  appName: "your-application-name",
  environmentName: "your-environment-name",
  entityName: "your-entity-name",
  payload: todos
});
```

Or with then/catch:
```javascript
nodb.writeEntities({
  appName: "your-application-name",
  environmentName: "your-environment-name",
  entityName: "your-entity-name",
  payload: todos
}).then(console.log); // get the ids
```

Let's make a sample inquiry using .inquire method, useful for RAG applications:
```javascript
const { answer } = await nodb.inquire({
  appName: "your-application-name",
  environmentName: "your-environment-name",
  inquiry: "Which todo has highest priority?",
});
//Or
nodb.inquire({
  appName: "your-application-name",
  environmentName: "your-environment-name",
  inquiry: "Which todo has highest priority?",
}).then(console.log);
```
The response returned from inquire method has the following definition:
```javascript
{
  answer: "Finishing report has highest priority.";
}
```
## Testing
We are using jest to run e2e tests. You can run them with
```javascript
npm run test
```
For testing we have a .env.test file where the only env variable that is specified is:
```javascript
NODB_BASE_URL=
```

