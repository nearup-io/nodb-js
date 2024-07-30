# Nodb JS/TS Sdk

Nodb NPM is a wrapper for [nodb API](https://github.com/nearup-io/nodb). It allows you to do CRUD operations over your Postgres database via API directly. Nodb keeps track of vector embeddings using pgvector so that you can do retrieval-augmented generation (RAG) using vector search.
Nodb offers real-time updates using websockets by connecting to the Nodb API and subscribing to changes.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Key Concepts](#key-concepts)
4. [Usage](#usage)
   1. [Creating Your First Application and Environment](#creating-your-first-application-and-environment)
   2. [Working with Tokens](#working-with-tokens)
   3. [Writing Entities](#writing-entities)
   4. [Inquiring Data](#inquiring-data)
   5. [WebSocket Support](#websocket-support)
5. [Testing](#testing)
6. [API Reference](#api-reference)

## Installation

Nodb supports both ESM and CommonJS modules, allowing you to integrate it seamlessly into your projects using either module system and you can use it with npm, yarn, bun, etc.

First install the NPM package (e.g. with npm, yarn, pnpm, bun):

```bash
npm install nodb-js-sdk
```

## Getting Started

To begin using NodbSDK, import the Nodb class:

```typescript
import Nodb from "nodb-js-sdk";
//OR
const Nodb = require("nodb-js-sdk");
```
If you're using import you should add "type": "module" to package.json.
You need to create an instance of Nodb now:
```typescript
const nodb = new Nodb({
  baseUrl: "localhost:3000",
});
```
## Key Concepts

NodbSDK works with the following hierarchical structure:

- Application: The top-level container
- Environments: Belong to an application
- Entities: Belong to an environment

One application can contain multiple environments, and each environment can contain multiple entities.

## Usage
### Creating Your First Application and Environment

To create your first application with an environment:

```typescript
const application = await nodb.createAppWithEnvironmentAndGetTokens({
  appName: "your-application-name",
  environmentName: "your-environment-name",
});
```

### Working with Tokens

After creating an application, you'll receive tokens for both the application and the environment:

```typescript
// Token for your application (broader permission scope)
const appToken = application.applicationTokens[0].key;

// Token for your environment (limited scope of permissions for the environment)
const envToken = application.environmentTokens[0].key;
```

### Setting Tokens

You can set a token globally for all subsequent operations:

```typescript
nodb.setToken(appToken);
```

Alternatively, you can provide tokens individually for each method call. If both a global token and a method-specific token are provided, the method-specific token takes precedence.

### Writing Entities

Let's write our first entities. Prepare some data that you'll import:
```typescript
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
```typescript
const ids = await nodb.writeEntities({
  appName: "your-application-name",
  environmentName: "your-environment-name",
  entityName: "your-entity-name",
  payload: todos
});
```

Or with then/catch:
```typescript
nodb.writeEntities({
  appName: "your-application-name",
  environmentName: "your-environment-name",
  entityName: "your-entity-name",
  payload: todos
}).then(console.log); // get the ids
```

### Inquiring Data

Let's make a sample inquiry using .inquire method, useful for RAG applications:
```typescript
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
```typescript
{
  answer: "Finishing report has highest priority.";
}
```
### WebSocket Support

Our SDK provides WebSocket support for monitoring write, update, and delete events on your Nodb API. You can easily connect to the WebSocket with the `connectToSocket` method:

**Example usage:**

```typescript
nodb.connectToSocket({
  appName: "your-app-name",
  envName: "your-env-name", // Optional: Listen to all events for an application if omitted.
  socketBaseUrl: "ws://localhost:3000", // Optional: If not provided, we automatically convert the base URL for you.
  token: "yourToken" // Optional: If omitted, we use the previously provided token. An error will be thrown if no token is provided and none has been set before.
})
```

Upon a successful connection, a message will appear in the console, indicating that you are now connected to the WebSocket. You will start receiving real-time updates about your application or environment.

To close the WebSocket connection, simply call:

```typescript
nodb.disconnectFromSocket()
```

With these methods, you can seamlessly integrate WebSocket functionality into your application for real-time updates.

## Testing
We are using jest to run e2e tests. You can run them with
```typescript
npm run test
```
For testing we have a .env.test file where the only env variable that is specified is:
```typescript
NODB_BASE_URL=
```

## API Reference
The `Nodb` class provides methods for interacting with a NoDB (NoSQL Database) backend via HTTP and WebSocket connections. It extends the `NodbWebSocket` class to support WebSocket functionality.

### Constructor

```typescript
constructor({ token, baseUrl }: NodbConstructor)
```

- **Parameters:**
  - `token` (optional, `string`): Authentication token for API requests.
  - `baseUrl` (`string`): Base URL for the API endpoints.

### Methods

#### `setToken`

```typescript
setToken(token: string): void
```

#### `writeEntities`

```typescript
async writeEntities(props: BaseAPIProps & PostEntityRequestBody): Promise<string[]>
```

#### `writeEntity`

```typescript
async writeEntity(props: BaseAPIProps & { payload: EntityBody }): Promise<string>
```

#### `updateEntities`

```typescript
async updateEntities(props: BaseAPIProps & PatchRequestBody): Promise<string[]>
```

#### `updateEntity`

```typescript
async updateEntity(props: BaseAPIProps & { payload: EntityBodyWithId }): Promise<string>
```

#### `replaceEntities`

```typescript
async replaceEntities(props: BaseAPIProps & PatchRequestBody): Promise<string[]>
```

#### `replaceEntity`

```typescript
async replaceEntity(props: BaseAPIProps & { payload: EntityBodyWithId }): Promise<string>
```

#### `deleteEntities`

```typescript
async deleteEntities(props: BaseAPIProps): Promise<number>
```

#### `deleteEntity`

```typescript
async deleteEntity(props: BaseAPIProps & EntityId): Promise<boolean>
```

#### `getEntity`

```typescript
async getEntity(props: BaseAPIProps & EntityId): Promise<Entity>
```

#### `getEntities`

```typescript
async getEntities(props: BaseAPIProps): Promise<EntityResponse>
```

#### `inquire`

```typescript
async inquire(props: Inquiry & Pick<BaseAPIProps, "appName" | "envName" | "token">): Promise<{ answer: string }>
```

#### `createApplication`

```typescript
async createApplication(props: PostApplicationBody): Promise<PostApplicationResponse>
```

#### `createEnvironmentInApp`

```typescript
async createEnvironmentInApp(props: PostEnvironmentBody): Promise<PostEnvironmentResponse>
```

#### `deleteEnvironmentFromApp`

```typescript
async deleteEnvironmentFromApp(props: { appName: string; environmentName: string; token?: string }): Promise<boolean>
```

#### `deleteApplication`

```typescript
async deleteApplication(props: { appName: string; token?: string }): Promise<boolean>
```

#### `createApplicationToken`

```typescript
async createApplicationToken(props: { appName: string; permission: TokenPermissions; token?: string }): Promise<PostApplicationTokenResponse>
```

#### `createEnvironmentToken`

```typescript
async createEnvironmentToken(props: { appName: string; envName: string; permission: TokenPermissions; token?: string }): Promise<PostEnvironmentTokenResponse>
```

#### `revokeApplicationToken`

```typescript
async revokeApplicationToken(props: { appName: string; tokenToBeRevoked: string; token?: string }): Promise<boolean>
```

#### `revokeEnvironmentToken`

```typescript
async revokeEnvironmentToken(props: { appName: string; envName: string; tokenToBeRevoked: string; token?: string }): Promise<boolean>
```

#### `connectToSocket`

```typescript
connectToSocket(props: { appName: string; envName?: string; token?: string; socketBaseUrl?: string }): void
```

#### `disconnectFromSocket`

```typescript
disconnectFromSocket(): void
```
