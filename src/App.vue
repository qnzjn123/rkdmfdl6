<template>
  <div id="app">
    <div class="container">
      <header class="header">
        <div class="logo">
          <i class="fas fa-cloud"></i>
          임가을 개인 클라우드 저장소
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link" :class="{ active: $route.name === 'Home' }">
            <i class="fas fa-home"></i>
            홈
          </router-link>
          <router-link to="/about" class="nav-link" :class="{ active: $route.name === 'About' }">
            <i class="fas fa-info-circle"></i>
            소개
          </router-link>
        </nav>
      </header>
      
      <router-view @show-notification="showNotification" />
      

      
      <!-- 알림 -->
      <div v-if="notification" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>
      
      <!-- 관리자 로그인 모달 -->
      <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
        <div class="modal" @click.stop>
          <h2>
            <i class="fas fa-lock"></i>
            관리자 로그인
          </h2>
          <form @submit.prevent="login">
            <div class="form-group">
              <label for="password">비밀번호</label>
              <input
                id="password"
                type="password"
                v-model="loginPassword"
                class="form-control"
                placeholder="관리자 비밀번호를 입력하세요"
                required
              />
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" @click="closeLoginModal" class="btn">
                취소
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loginLoading">
                <i class="fas fa-sign-in-alt"></i>
                {{ loginLoading ? '로그인 중...' : '로그인' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      showLoginModal: false,
      loginPassword: '',
      loginLoading: false,
      notification: null,
      isAdmin: false
    };
  },
  mounted() {
    // Alt + L 키 조합으로 관리자 로그인 모달 열기
    document.addEventListener('keydown', this.handleKeyDown);
    
    // 관리자 토큰 확인
    this.checkAdminToken();
    
    // API 기본 설정
    axios.defaults.baseURL = 'http://localhost:3001';
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      // Alt + L 키 조합 감지
      if (event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        this.showLoginModal = true;
      }
    },
    
    checkAdminToken() {
      const token = localStorage.getItem('adminToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.isAdmin = true;
      }
    },
    
    async login() {
      this.loginLoading = true;
      try {
        const response = await axios.post('/api/login', {
          password: this.loginPassword
        });
        
        if (response.data.success) {
          localStorage.setItem('adminToken', response.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          this.isAdmin = true;
          this.showNotification('관리자 로그인 성공! 🚀', 'success');
          this.closeLoginModal();
          this.$router.push('/admin');
        }
      } catch (error) {
        this.showNotification(
          error.response?.data?.message || '로그인에 실패했습니다.',
          'error'
        );
      } finally {
        this.loginLoading = false;
      }
    },
    
    logout() {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      this.isAdmin = false;
      this.showNotification('관리자 로그아웃되었습니다. 👋', 'success');
      this.$router.push('/');
    },
    
    closeLoginModal() {
      this.showLoginModal = false;
      this.loginPassword = '';
      this.loginLoading = false;
    },
    
    showNotification(message, type = 'success') {
      this.notification = { message, type };
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}
</style> 