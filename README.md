# ChitChat - Real-Time Chat Application

A real-time chat application built with Angular and Socket.IO.

## Features

- Real-time messaging
- Room-based chat system
- User lists per room
- System notifications

## Prerequisites

- Node.js and npm
- Angular CLI
- Socket.IO backend server running on http://localhost:3000

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm start`
4. Open your browser and navigate to `http://localhost:4200`

## Backend Server

This frontend expects a Socket.IO server running at http://localhost:3000 with the following event handlers:

- `join room`: When a user joins a chat room
- `chat message`: For sending messages
- `user list`: For updating the list of users in a room
- `system message`: For system notifications

## How to Use

1. Enter your nickname and select a room
2. Click "Join" to enter the chat
3. Type messages and press Enter or click "Send" to send them
4. View other users in the room in the users list

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
