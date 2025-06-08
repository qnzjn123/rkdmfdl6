import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Admin from '../views/Admin.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 라우터 가드
router.beforeEach((to, from, next) => {
  // 관리자 페이지 접근 시에만 토큰 확인
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      next('/');
      return;
    }
  }
  
  next();
});

export default router; 