# Installation

Below are the instructions for setting up and running the project.

## Project Structure

```
my-vue-app
├── .github
│   └── workflows
│       └── deploy.yml
├── public
│   └── index.html
├── src
│   ├── assets
│   ├── components
│   │   └── HelloWorld.vue
│   ├── views
│   │   └── Home.vue
│   ├── App.vue
│   └── main.js
├── .gitignore
├── package.json
├── README.md
└── vue.config.js
```

## Installation

To install the project dependencies, run the following command:

```
npm install
```

## Running the Application

To start the development server, use the following command:

```
npm run serve
```

The application will be available at `http://localhost:8080`.

## Building for Production

To build the application for production, run:

```
npm run build
```

The built files will be generated in the `dist` directory.

## Deployment

This project includes a GitHub Action for deployment. The configuration can be found in `.github/workflows/deploy.yml`. Make sure to set up the necessary secrets in your GitHub repository for deployment to your hosting provider.

## License

This project is licensed under the MIT License.

# Project

Reference: https://bpmsg.com/ahp/ahp-calc.php?lang=de
