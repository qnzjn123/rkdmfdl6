<template>
  <div class="home">
    <!-- 환영 메시지 -->
    <div class="card">
      <h1>
        <i class="fas fa-feather-alt"></i>
        임가을 개인 클라우드 저장소
      </h1>
      <p>임가을 개인 클라우드 저장소</p>
    </div>

    <!-- 공개 파일 목록 -->
    <div class="card">
      <h2>
        <i class="fas fa-cloud"></i>
        개인클라우드 공간
      </h2>
      
      <div v-if="loading" style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
        <p style="margin-top: 10px;">파일 목록을 불러오는 중...</p>
      </div>
      
      <div v-else-if="publicFiles.length === 0" style="text-align: center; padding: 40px;">
        <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: #667eea; margin-bottom: 20px;"></i>
        <h3>아직 공유된 파일이 없어요</h3>
        <p>곧 관리자가 멋진 파일들을 업로드할 예정입니다! 📁</p>
      </div>
      
      <div v-else class="file-list">
        <div v-for="file in paginatedFiles" :key="file.id" class="file-item">
          <!-- 이미지 미리보기 -->
          <img
            v-if="isImage(file.mimetype)"
            :src="`http://localhost:3001/api/download/${file.filename}`"
            :alt="file.originalName"
            class="image-preview"
            @error="handleImageError"
          />
          
          <div class="file-info">
            <div class="file-icon">
              <i :class="getFileIcon(file.mimetype)"></i>
            </div>
            <div class="file-details">
              <h3>{{ file.originalName }}</h3>
              <p>{{ formatFileSize(file.size) }} • {{ formatDate(file.uploadDate) }}</p>
              <p v-if="file.description" style="color: #666; font-style: italic;">{{ file.description }}</p>
            </div>
          </div>
          
          <div class="file-actions">
            <a 
              :href="`http://localhost:3001/api/download/${file.filename}`" 
              class="btn btn-success"
              :download="file.originalName"
            >
              <i class="fas fa-download"></i>
              다운로드
            </a>
          </div>
        </div>
        
        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
            이전
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="changePage(page)"
              :class="['page-number', { active: currentPage === page }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            다음
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      publicFiles: [],
      loading: false,
      currentPage: 1,
      itemsPerPage: 5
    };
  },
  computed: {
    // 현재 페이지에 표시할 파일들
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.publicFiles.slice(start, end);
    },
    
    // 총 페이지 수
    totalPages() {
      return Math.ceil(this.publicFiles.length / this.itemsPerPage);
    },
    
    // 페이지 번호 배열
    pageNumbers() {
      const pages = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  
  mounted() {
    this.loadPublicFiles();
  },
  methods: {
    async loadPublicFiles() {
      this.loading = true;
      try {
        const response = await axios.get('/api/files');
        if (response.data.success) {
          // 공개 파일만 필터링
          this.publicFiles = response.data.files
            .filter(file => file.isPublic)
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        }
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // 페이지네이션 메서드들
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    getFileIcon(mimeType) {
      if (!mimeType) return 'fas fa-file';
      
      if (mimeType.startsWith('image/')) return 'fas fa-image';
      if (mimeType.startsWith('video/')) return 'fas fa-video';
      if (mimeType.startsWith('audio/')) return 'fas fa-music';
      if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word';
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'fas fa-file-archive';
      if (mimeType.includes('text/')) return 'fas fa-file-alt';
      
      return 'fas fa-file';
    },
    
    isImage(mimeType) {
      return mimeType && mimeType.startsWith('image/');
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    handleImageError(event) {
      event.target.style.display = 'none';
    }
  }
};
</script>

<style scoped>
/* 파일 액션 버튼 스타일 */
.file-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.file-actions .btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  white-space: nowrap;
}

/* 페이지네이션 스타일 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #667eea;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.pagination-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  border-color: #e9ecef;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.page-number.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .file-actions {
    justify-content: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .page-numbers {
    order: -1;
  }
  
  .pagination-btn {
    width: 120px;
    justify-content: center;
  }
}
</style> 