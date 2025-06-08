<template>
  <div class="admin">
    <!-- 관리자 대시보드 헤더 -->
    <div class="card">
      <h1>
        <i class="fas fa-user-edit"></i>
        임가을 블로그 관리자
      </h1>
      <p>블로그 자료를 관리하고 모니터링하세요. 🍁</p>
    </div>

    <!-- 스토리지 정보 -->
    <div class="card">
      <h2>
        <i class="fas fa-chart-pie"></i>
        블로그 자료 통계
      </h2>
      
      <div v-if="loadingStats" style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
        <p style="margin-top: 10px;">통계를 불러오는 중...</p>
      </div>
      
      <div v-else class="storage-info">
        <div class="storage-stat">
          <h3>{{ storageInfo.fileCount || 0 }}</h3>
          <p>총 파일 수</p>
        </div>
        <div class="storage-stat">
          <h3>{{ storageInfo.formattedSize || '0 Bytes' }}</h3>
          <p>사용 중인 저장공간</p>
        </div>
        <div class="storage-stat">
          <h3>{{ publicFileCount }}</h3>
          <p>공개 파일</p>
        </div>
        <div class="storage-stat">
          <h3>{{ privateFileCount }}</h3>
          <p>비공개 파일</p>
        </div>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button @click="loadStorageInfo" class="btn btn-primary">
          <i class="fas fa-sync-alt"></i>
          통계 새로고침
        </button>
      </div>
    </div>

    <!-- 파일 업로드 -->
    <div class="card">
      <h2>
        <i class="fas fa-feather-alt"></i>
        블로그 자료 업로드
      </h2>
      
      <div 
        class="file-upload-area"
        :class="{ dragover: isDragOver }"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; margin-bottom: 20px; color: #667eea;"></i>
        <h3>파일을 여기에 드래그하거나 클릭하여 선택하세요</h3>
        <p>최대 10GB까지 업로드 가능합니다</p>
        <input
          ref="fileInput"
          type="file"
          multiple
          @change="handleFileSelect"
          style="display: none;"
        />
      </div>

      <!-- 업로드 옵션 -->
      <div v-if="uploadSelectedFiles.length > 0" class="upload-options" style="margin-top: 20px;">
        <div class="form-group">
          <label for="uploadDescription">파일 설명 (선택사항)</label>
          <textarea
            id="uploadDescription"
            v-model="fileDescription"
            class="form-control"
            rows="3"
            placeholder="파일에 대한 설명을 입력하세요..."
          ></textarea>
        </div>
        
        <div class="checkbox-group">
          <input
            id="uploadIsPublic"
            type="checkbox"
            v-model="isPublic"
          />
          <label for="uploadIsPublic">공개 파일로 설정 (다른 사람들이 볼 수 있습니다)</label>
        </div>

        <div style="margin-top: 20px;">
          <button @click="uploadFiles" class="btn btn-primary" :disabled="uploading">
            <i class="fas fa-upload"></i>
            {{ uploading ? '업로드 중...' : '업로드 시작' }}
          </button>
          <button @click="clearUploadSelection" class="btn" style="margin-left: 10px;">
            <i class="fas fa-times"></i>
            선택 취소
          </button>
        </div>
      </div>

      <!-- 선택된 파일 목록 -->
      <div v-if="uploadSelectedFiles.length > 0" class="selected-files" style="margin-top: 20px;">
        <h3>선택된 파일들:</h3>
        <div class="upload-file-list">
          <div v-for="(file, index) in uploadSelectedFiles" :key="index" class="upload-file-item">
            <div class="file-info">
              <div class="file-icon">
                <i :class="getFileIcon(file.type)"></i>
              </div>
              <div class="file-details">
                <h4>{{ file.name }}</h4>
                <p>{{ formatFileSize(file.size) }}</p>
              </div>
            </div>
            <button @click="removeFile(index)" class="btn btn-danger btn-sm">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 업로드 진행률 -->
      <div v-if="uploading" class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        <div class="progress-text">{{ uploadProgress }}% 완료</div>
      </div>
    </div>

    <!-- 파일 관리 -->
    <div class="card">
      <h2>
        <i class="fas fa-archive"></i>
        블로그 자료 관리
      </h2>
      
      <!-- 필터 및 검색 -->
      <div class="admin-controls">
        <div class="control-group">
          <label for="adminSearch">검색</label>
          <input
            id="adminSearch"
            type="text"
            v-model="searchQuery"
            class="form-control"
            placeholder="파일명으로 검색..."
            @input="applyFilters"
          />
        </div>
        
        <div class="control-group">
          <label for="fileTypeFilter">파일 타입</label>
          <select id="fileTypeFilter" v-model="fileTypeFilter" class="form-control" @change="applyFilters">
            <option value="">모든 파일</option>
            <option value="image">이미지</option>
            <option value="video">비디오</option>
            <option value="audio">오디오</option>
            <option value="document">문서</option>
            <option value="archive">압축파일</option>
            <option value="other">기타</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="visibilityFilter">공개 상태</label>
          <select id="visibilityFilter" v-model="visibilityFilter" class="form-control" @change="applyFilters">
            <option value="">전체</option>
            <option value="public">공개</option>
            <option value="private">비공개</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="adminSortBy">정렬</label>
          <select id="adminSortBy" v-model="sortBy" class="form-control" @change="applyFilters">
            <option value="newest">최신순</option>
            <option value="oldest">오래된 순</option>
            <option value="name">이름순</option>
            <option value="size">크기순</option>
          </select>
        </div>
        
        <div class="control-group">
          <button @click="loadAllFiles" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i>
            새로고침
          </button>
        </div>
      </div>

      <!-- 일괄 작업 -->
      <div v-if="selectedFiles.length > 0" class="bulk-actions">
        <p><strong>{{ selectedFiles.length }}개 파일 선택됨</strong></p>
        <button @click="bulkDelete" class="btn btn-danger">
          <i class="fas fa-trash-alt"></i>
          선택된 파일 삭제
        </button>
        <button @click="clearSelection" class="btn">
          <i class="fas fa-times"></i>
          선택 해제
        </button>
      </div>

      <!-- 파일 목록 -->
      <div v-if="loadingFiles" style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
        <p style="margin-top: 10px;">파일 목록을 불러오는 중...</p>
      </div>
      
      <div v-else-if="filteredFiles.length === 0" style="text-align: center; padding: 40px;">
        <i class="fas fa-folder-open" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
        <h3>표시할 파일이 없습니다</h3>
        <p>검색 조건을 변경하거나 파일을 업로드해보세요.</p>
      </div>
      
      <div v-else class="admin-file-list">
        <div class="file-list-header">
          <div class="file-header-item">
            <input 
              type="checkbox" 
              @change="toggleSelectAll" 
              :checked="allSelected"
              :indeterminate="someSelected"
            />
          </div>
          <div class="file-header-item">파일명</div>
          <div class="file-header-item">크기</div>
          <div class="file-header-item">타입</div>
          <div class="file-header-item">상태</div>
          <div class="file-header-item">업로드일</div>
          <div class="file-header-item">작업</div>
        </div>
        
        <div 
          v-for="file in filteredFiles" 
          :key="file.id" 
          class="admin-file-item"
          :class="{ selected: selectedFiles.includes(file.filename) }"
        >
          <div class="file-item-content">
            <input 
              type="checkbox" 
              :value="file.filename"
              v-model="selectedFiles"
            />
          </div>
          
          <div class="file-item-content file-name">
            <div class="file-icon">
              <i :class="getFileIcon(file.mimetype)"></i>
            </div>
            <div>
              <div class="file-title">{{ file.originalName }}</div>
              <div v-if="file.description" class="file-description">{{ file.description }}</div>
            </div>
          </div>
          
          <div class="file-item-content">{{ formatFileSize(file.size) }}</div>
          
          <div class="file-item-content">
            <span class="file-type-badge" :class="getFileTypeClass(file.mimetype)">
              {{ getFileType(file.mimetype) }}
            </span>
          </div>
          
          <div class="file-item-content">
            <span class="visibility-badge" :class="file.isPublic ? 'public' : 'private'">
              <i :class="file.isPublic ? 'fas fa-globe' : 'fas fa-lock'"></i>
              {{ file.isPublic ? '공개' : '비공개' }}
            </span>
          </div>
          
          <div class="file-item-content">{{ formatDate(file.uploadDate) }}</div>
          
          <div class="file-item-content file-actions">
            <a 
              :href="`http://localhost:3001/api/download/${file.filename}`" 
              class="btn btn-success btn-sm"
              :download="file.originalName"
              title="다운로드"
            >
              <i class="fas fa-download"></i>
            </a>
            <button 
              @click="copyFileUrl(file)" 
              class="btn btn-primary btn-sm"
              title="링크 복사"
            >
              <i class="fas fa-link"></i>
            </button>
            <button 
              @click="deleteFile(file)" 
              class="btn btn-danger btn-sm"
              title="삭제"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 시스템 정보 -->
    <div class="card">
      <h2>
        <i class="fas fa-cog"></i>
        블로그 시스템 정보
      </h2>
      
      <div class="system-info">
        <div class="info-item">
          <strong>블로그 관리자 비밀번호:</strong>
          <code>SuperSecureCloudAdmin!@#$%^&*()_+{}|:<>?[]\\;\',./'</code>
        </div>
        <div class="info-item">
          <strong>최대 업로드 크기:</strong>
          10GB
        </div>
        <div class="info-item">
          <strong>지원 파일 형식:</strong>
          모든 형식 지원 (문서, 이미지, 동영상 등)
        </div>
        <div class="info-item">
          <strong>블로그 서버 포트:</strong>
          3001
        </div>
        <div class="info-item">
          <strong>자료 저장 위치:</strong>
          server/uploads, server/public, server/private
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h2>
          <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
          파일 삭제 확인
        </h2>
        <p v-if="fileToDelete">
          <strong>{{ fileToDelete.originalName }}</strong> 파일을 삭제하시겠습니까?
        </p>
        <p v-else>
          선택된 <strong>{{ selectedFiles.length }}개</strong> 파일을 삭제하시겠습니까?
        </p>
        <p style="color: #ff6b6b; font-weight: 600;">이 작업은 되돌릴 수 없습니다!</p>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
          <button @click="cancelDelete" class="btn">
            취소
          </button>
          <button @click="confirmDelete" class="btn btn-danger" :disabled="deleting">
            <i class="fas fa-trash"></i>
            {{ deleting ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Admin',
  data() {
    return {
      storageInfo: {},
      loadingStats: false,
      allFiles: [],
      filteredFiles: [],
      loadingFiles: false,
      searchQuery: '',
      fileTypeFilter: '',
      visibilityFilter: '',
      sortBy: 'newest',
      selectedFiles: [],
      showDeleteConfirm: false,
      fileToDelete: null,
      deleting: false,
      // 파일 업로드 관련
      uploadSelectedFiles: [],
      fileDescription: '',
      isPublic: true,
      uploading: false,
      uploadProgress: 0,
      isDragOver: false
    };
  },
  computed: {
    publicFileCount() {
      return this.allFiles.filter(file => file.isPublic).length;
    },
    privateFileCount() {
      return this.allFiles.filter(file => !file.isPublic).length;
    },
    allSelected() {
      return this.filteredFiles.length > 0 && 
             this.selectedFiles.length === this.filteredFiles.length;
    },
    someSelected() {
      return this.selectedFiles.length > 0 && 
             this.selectedFiles.length < this.filteredFiles.length;
    }
  },
  mounted() {
    this.loadStorageInfo();
    this.loadAllFiles();
  },
  methods: {
    async loadStorageInfo() {
      this.loadingStats = true;
      try {
        const response = await axios.get('/api/storage-info');
        if (response.data.success) {
          this.storageInfo = response.data;
        }
      } catch (error) {
        console.error('Failed to load storage info:', error);
        this.$parent.showNotification('스토리지 정보를 불러오는데 실패했습니다.', 'error');
      } finally {
        this.loadingStats = false;
      }
    },
    
    async loadAllFiles() {
      this.loadingFiles = true;
      try {
        const response = await axios.get('/api/files');
        if (response.data.success) {
          this.allFiles = response.data.files;
          this.applyFilters();
        }
      } catch (error) {
        console.error('Failed to load files:', error);
        this.$parent.showNotification('파일 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        this.loadingFiles = false;
      }
    },
    
    applyFilters() {
      let filtered = [...this.allFiles];
      
      // 검색 필터
      if (this.searchQuery) {
        filtered = filtered.filter(file =>
          file.originalName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      // 파일 타입 필터
      if (this.fileTypeFilter) {
        filtered = filtered.filter(file => {
          const type = this.getFileType(file.mimetype).toLowerCase();
          return type === this.fileTypeFilter;
        });
      }
      
      // 공개 상태 필터
      if (this.visibilityFilter) {
        filtered = filtered.filter(file => {
          if (this.visibilityFilter === 'public') return file.isPublic;
          if (this.visibilityFilter === 'private') return !file.isPublic;
          return true;
        });
      }
      
      // 정렬
      switch (this.sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
          break;
        case 'name':
          filtered.sort((a, b) => a.originalName.localeCompare(b.originalName));
          break;
        case 'size':
          filtered.sort((a, b) => b.size - a.size);
          break;
      }
      
      this.filteredFiles = filtered;
      
      // 선택된 파일 중 필터링된 결과에 없는 것들 제거
      this.selectedFiles = this.selectedFiles.filter(filename =>
        this.filteredFiles.some(file => file.filename === filename)
      );
    },
    
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedFiles = this.filteredFiles.map(file => file.filename);
      } else {
        this.selectedFiles = [];
      }
    },
    
    clearSelection() {
      this.selectedFiles = [];
    },
    
    deleteFile(file) {
      this.fileToDelete = file;
      this.showDeleteConfirm = true;
    },
    
    bulkDelete() {
      this.fileToDelete = null;
      this.showDeleteConfirm = true;
    },
    
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.fileToDelete = null;
    },
    
    async confirmDelete() {
      this.deleting = true;
      
      try {
        if (this.fileToDelete) {
          // 단일 파일 삭제
          await axios.delete(`/api/files/${this.fileToDelete.filename}`);
          this.$parent.showNotification('파일이 삭제되었습니다.', 'success');
        } else {
          // 일괄 삭제
          const deletePromises = this.selectedFiles.map(filename => 
            axios.delete(`/api/files/${filename}`)
          );
          await Promise.all(deletePromises);
          this.$parent.showNotification(`${this.selectedFiles.length}개 파일이 삭제되었습니다.`, 'success');
          this.selectedFiles = [];
        }
        
        this.loadAllFiles();
        this.loadStorageInfo();
      } catch (error) {
        console.error('Delete failed:', error);
        this.$parent.showNotification('파일 삭제에 실패했습니다.', 'error');
      } finally {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.fileToDelete = null;
      }
    },
    
    async copyFileUrl(file) {
      const url = `http://localhost:3001/api/download/${file.filename}`;
      try {
        await navigator.clipboard.writeText(url);
        this.$parent.showNotification('링크가 클립보드에 복사되었습니다!', 'success');
      } catch (error) {
        // 클립보드 API 폴백
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.$parent.showNotification('링크가 클립보드에 복사되었습니다!', 'success');
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
    
    getFileType(mimeType) {
      if (!mimeType) return 'other';
      
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || 
          mimeType.includes('excel') || mimeType.includes('powerpoint') || mimeType.includes('text/')) return 'document';
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
      
      return 'other';
    },
    
    getFileTypeClass(mimeType) {
      const type = this.getFileType(mimeType);
      return `type-${type}`;
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

    // 파일 업로드 관련 메서드
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.uploadSelectedFiles = [...this.uploadSelectedFiles, ...files];
    },
    
    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      const files = Array.from(event.dataTransfer.files);
      this.uploadSelectedFiles = [...this.uploadSelectedFiles, ...files];
    },
    
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },
    
    handleDragLeave() {
      this.isDragOver = false;
    },
    
    removeFile(index) {
      this.uploadSelectedFiles.splice(index, 1);
    },
    
    clearUploadSelection() {
      this.uploadSelectedFiles = [];
      this.fileDescription = '';
      this.isPublic = true;
    },
    
    async uploadFiles() {
      if (this.uploadSelectedFiles.length === 0) return;
      
      this.uploading = true;
      this.uploadProgress = 0;
      
      const formData = new FormData();
      this.uploadSelectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('description', this.fileDescription);
      formData.append('isPublic', this.isPublic);
      
      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        });
        
        if (response.data.success) {
          this.$parent.showNotification(
            `${this.uploadSelectedFiles.length}개 파일이 성공적으로 업로드되었습니다!`,
            'success'
          );
          this.clearUploadSelection();
          this.loadAllFiles(); // 파일 목록 새로고침
          this.loadStorageInfo(); // 스토리지 정보 새로고침
        }
      } catch (error) {
        this.$parent.showNotification(
          error.response?.data?.message || '파일 업로드에 실패했습니다.',
          'error'
        );
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    }
  }
};
</script>

<style scoped>
.admin-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  align-items: end;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.bulk-actions {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-file-list {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.file-list-header {
  display: grid;
  grid-template-columns: 40px 1fr 100px 100px 100px 120px 120px;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e9ecef;
}

.file-header-item {
  display: flex;
  align-items: center;
}

.admin-file-item {
  display: grid;
  grid-template-columns: 40px 1fr 100px 100px 100px 120px 120px;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.admin-file-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.admin-file-item.selected {
  background: rgba(102, 126, 234, 0.1);
}

.file-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  min-width: 0;
}

.file-title {
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-description {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-icon {
  font-size: 1.2rem;
  color: #667eea;
  flex-shrink: 0;
}

.file-type-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-image { background: #e3f2fd; color: #1976d2; }
.type-video { background: #fce4ec; color: #c2185b; }
.type-audio { background: #f3e5f5; color: #7b1fa2; }
.type-document { background: #e8f5e8; color: #388e3c; }
.type-archive { background: #fff3e0; color: #f57c00; }
.type-other { background: #f5f5f5; color: #616161; }

.visibility-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.visibility-badge.public {
  background: #e8f5e8;
  color: #388e3c;
}

.visibility-badge.private {
  background: #ffebee;
  color: #d32f2f;
}

.file-actions {
  gap: 5px;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 12px;
}

.system-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.info-item strong {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.info-item code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #d63384;
}

/* 반응형 */
@media (max-width: 1200px) {
  .file-list-header,
  .admin-file-item {
    grid-template-columns: 40px 1fr 80px 80px 80px 100px 100px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .admin-controls {
    grid-template-columns: 1fr;
  }
  
  .file-list-header,
  .admin-file-item {
    grid-template-columns: 30px 1fr 60px 60px 60px 80px;
    font-size: 0.85rem;
    gap: 10px;
    padding: 10px;
  }
  
  .file-list-header .file-header-item:nth-child(5),
  .admin-file-item .file-item-content:nth-child(5) {
    display: none; /* 모바일에서 업로드일 숨김 */
  }
  
  .bulk-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .system-info {
    grid-template-columns: 1fr;
  }
}

/* 파일 업로드 관련 스타일 */
.upload-file-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.upload-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.upload-file-item .file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.upload-file-item .file-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.upload-file-item .file-details h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.upload-file-item .file-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.upload-options {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.progress-bar {
  position: relative;
  margin-top: 20px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-size: 14px;
}
</style> 