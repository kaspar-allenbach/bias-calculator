import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';

const routes = [
  {
    path: '/',
    component: Home,
  },
  // Add more routes as needed
];

const router = createRouter({
  history: createWebHistory('/bias-calculator/'),  // Correct base path for GitHub Pages
  routes,
});

export default router;
