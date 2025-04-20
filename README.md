# Basic

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.1.2.
The project demonstrates a TanStack table with expandable rows, lazy loading, and row selection using checkboxes. The data is stored in local storage since there is no backend or real server to support it. Upon refresh, the state is loaded from local storage.
The project utilizes json-server to run a mock server and provide data for the application.
Data nodes are generated in `tree/src/app/makeFlatData.cjs` using Faker and stored in `tree/db.json`.

At present the number of nodes in db.json is kept small due to Git file size restrictions.
You can modify the number of generated nodes by adjusting the parameters in the following function inside `tree/src/app/makeFlatData.cjs`
`Array.from(makeFlatData(50, 100, 200)`
These three parameters represent the number of nodes generated at each level.
(Note: There may be a size limit on the generated file.)

Run `npm install` to install the required dependencies.

## Create a db.json file with provided records

Run `node src/app/makeFlatData.cjs`

## Run data server

Run `npx json-server --watch db.json --port 3000`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
