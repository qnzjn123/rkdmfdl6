<template>
  <div class="about">
    <!-- 메인 소개 섹션 -->
    <div class="card hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h1>임가을 개인 클라우드 저장소</h1>
        <p class="hero-subtitle">안전하고 편리한 개인 파일 관리 솔루션</p>
        <div class="hero-description">
          언제 어디서나 접근 가능한 나만의 클라우드 공간에서<br>
          소중한 파일들을 안전하게 보관하고 자유롭게 공유하세요.
        </div>
      </div>
    </div>

    <!-- 기능 소개 -->
    <div class="card">
      <h2>
        <i class="fas fa-star"></i>
        주요 기능
      </h2>
      
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-upload"></i>
          </div>
          <h3>간편한 파일 업로드</h3>
          <p>드래그 앤 드롭으로 쉽고 빠르게 파일을 업로드할 수 있습니다. 이미지, 문서, 동영상 등 다양한 형식을 지원합니다.</p>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-share-alt"></i>
          </div>
          <h3>파일 공유</h3>
          <p>공개/비공개 설정으로 원하는 파일만 선택적으로 공유할 수 있습니다. 링크 하나로 간편하게 파일을 전달하세요.</p>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h3>보안 관리</h3>
          <p>관리자 인증을 통한 안전한 파일 관리와 접근 제어로 개인 데이터를 보호합니다.</p>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <h3>반응형 디자인</h3>
          <p>PC, 태블릿, 모바일 등 다양한 기기에서 최적화된 환경으로 이용할 수 있습니다.</p>
        </div>
      </div>
    </div>

    <!-- 사용 방법 -->
    <div class="card">
      <h2>
        <i class="fas fa-question-circle"></i>
        사용 방법
      </h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>파일 업로드</h3>
            <p>관리자 로그인 후 원하는 파일을 드래그하여 업로드하거나 파일 선택 버튼을 클릭하세요.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>공개 설정</h3>
            <p>업로드한 파일의 공개/비공개 상태를 설정하여 원하는 파일만 방문자에게 공개할 수 있습니다.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>파일 공유</h3>
            <p>공개된 파일은 홈 페이지에서 누구나 다운로드할 수 있으며, 직접 링크를 공유할 수도 있습니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 기술 스펙 -->
    <div class="card">
      <h2>
        <i class="fas fa-cogs"></i>
        기술 사양
      </h2>
      
      <div class="tech-grid">
        <div class="tech-item">
          <div class="tech-icon">
            <i class="fab fa-vuejs"></i>
          </div>
          <h3>Vue.js</h3>
          <p>현대적인 프론트엔드 프레임워크</p>
        </div>
        
        <div class="tech-item">
          <div class="tech-icon">
            <i class="fab fa-node-js"></i>
          </div>
          <h3>Node.js</h3>
          <p>효율적인 서버 사이드 환경</p>
        </div>
        
        <div class="tech-item">
          <div class="tech-icon">
            <i class="fas fa-database"></i>
          </div>
          <h3>SQLite</h3>
          <p>가벼운 데이터베이스 솔루션</p>
        </div>
        
        <div class="tech-item">
          <div class="tech-icon">
            <i class="fas fa-lock"></i>
          </div>
          <h3>JWT 인증</h3>
          <p>안전한 사용자 인증 시스템</p>
        </div>
      </div>
    </div>

    <!-- 연락처 -->
    <div class="card contact-section">
      <h2>
        <i class="fas fa-envelope"></i>
        문의하기
      </h2>
      <p class="contact-text">
        서비스 이용 중 궁금하신 점이나 문제가 발생하시면<br>
        언제든지 관리자에게 문의해주세요.
      </p>
      <div class="contact-info">
        <div class="contact-item">
          <i class="fas fa-keyboard"></i>
          <span><strong>Alt + L</strong> 키로 관리자 페이지 접근</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
};
</script>

<style scoped>
.about {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 히어로 섹션 */
.hero-section {
  text-align: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.hero-content {
  padding: 40px 20px;
}

.hero-icon {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 20px;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 20px;
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
}

/* 기능 그리드 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.feature-item {
  text-align: center;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.feature-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 20px;
}

.feature-item h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #333;
}

.feature-item p {
  color: #666;
  line-height: 1.6;
}

/* 사용 방법 스텝 */
.steps {
  margin-top: 30px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  border-left: 4px solid #667eea;
}

.step-number {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content h3 {
  margin-bottom: 10px;
  color: #333;
  font-size: 1.2rem;
}

.step-content p {
  color: #666;
  line-height: 1.6;
}

/* 기술 스펙 그리드 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.tech-item {
  text-align: center;
  padding: 25px 15px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.tech-icon {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 15px;
}

.tech-item h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #333;
}

.tech-item p {
  color: #666;
  font-size: 0.9rem;
}

/* 연락처 섹션 */
.contact-section {
  text-align: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.contact-text {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 25px;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 25px;
  color: #333;
}

.contact-item i {
  color: #667eea;
  font-size: 1.2rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
  
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .contact-info {
    flex-direction: column;
    align-items: center;
  }
}
</style> 