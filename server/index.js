import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 보안을 위한 강력한 비밀번호와 JWT 시크릿
const ADMIN_PASSWORD_HASH = await bcrypt.hash('CloudMaster2024!@#$%^&*()', 12);
const JWT_SECRET = 'UltraSecureCloudStorageJWT2024!@#$%^&*()_+{}|:"<>?[]\\;\',./';

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PRIVATE_DIR = path.join(__dirname, 'private');

// 디렉토리 생성
await fs.ensureDir(UPLOAD_DIR);
await fs.ensureDir(PUBLIC_DIR);
await fs.ensureDir(PRIVATE_DIR);

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

// 대용량 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isPublic = req.body.isPublic === 'true';
    const targetDir = isPublic ? PUBLIC_DIR : PRIVATE_DIR;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB 제한
    fieldSize: 10 * 1024 * 1024 * 1024
  }
});

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  
  try {
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (isValid) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: '잘못된 비밀번호입니다.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 파일 업로드 API (대용량 지원)
app.post('/api/upload', upload.array('files', 50), async (req, res) => {
  try {
    const files = req.files;
    const isPublic = req.body.isPublic === 'true';
    const description = req.body.description || '';
    
    const uploadedFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date().toISOString(),
      isPublic,
      description,
      path: file.path
    }));

    // 파일 메타데이터 저장
    const metadataPath = path.join(__dirname, 'metadata.json');
    let metadata = [];
    
    if (await fs.pathExists(metadataPath)) {
      metadata = await fs.readJson(metadataPath);
    }
    
    metadata.push(...uploadedFiles);
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });

    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: '파일 업로드에 실패했습니다.' });
  }
});

// 파일 목록 조회 API
app.get('/api/files', async (req, res) => {
  try {
    const metadataPath = path.join(__dirname, 'metadata.json');
    let files = [];
    
    if (await fs.pathExists(metadataPath)) {
      files = await fs.readJson(metadataPath);
    }

    // 공개 파일만 반환 (관리자가 아닌 경우)
    const authHeader = req.headers['authorization'];
    let isAdmin = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET);
        isAdmin = true;
      } catch (err) {
        // 토큰이 유효하지 않으면 일반 사용자로 처리
        isAdmin = false;
      }
    }
    
    if (!isAdmin) {
      files = files.filter(file => file.isPublic);
    }

    res.json({ success: true, files });
  } catch (error) {
    console.error('Files list error:', error);
    res.status(500).json({ success: false, message: '파일 목록을 불러올 수 없습니다.' });
  }
});

// 파일 다운로드 API
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const metadataPath = path.join(__dirname, 'metadata.json');
    
    if (await fs.pathExists(metadataPath)) {
      const metadata = await fs.readJson(metadataPath);
      const file = metadata.find(f => f.filename === filename);
      
      if (file) {
        const filePath = file.path;
        
        if (await fs.pathExists(filePath)) {
          const mimeType = mime.lookup(file.originalName) || 'application/octet-stream';
          
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
          res.setHeader('Content-Length', file.size);
          
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
          return;
        }
      }
    }
    
    res.status(404).json({ success: false, message: '파일을 찾을 수 없습니다.' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: '파일 다운로드에 실패했습니다.' });
  }
});

// 파일 삭제 API (관리자만)
app.delete('/api/files/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const metadataPath = path.join(__dirname, 'metadata.json');
    
    if (await fs.pathExists(metadataPath)) {
      let metadata = await fs.readJson(metadataPath);
      const fileIndex = metadata.findIndex(f => f.filename === filename);
      
      if (fileIndex !== -1) {
        const file = metadata[fileIndex];
        
        // 실제 파일 삭제
        if (await fs.pathExists(file.path)) {
          await fs.unlink(file.path);
        }
        
        // 메타데이터에서 제거
        metadata.splice(fileIndex, 1);
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });
        
        res.json({ success: true, message: '파일이 삭제되었습니다.' });
        return;
      }
    }
    
    res.status(404).json({ success: false, message: '파일을 찾을 수 없습니다.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: '파일 삭제에 실패했습니다.' });
  }
});

// 스토리지 정보 API
app.get('/api/storage-info', authenticateToken, async (req, res) => {
  try {
    const metadataPath = path.join(__dirname, 'metadata.json');
    let totalSize = 0;
    let fileCount = 0;
    
    if (await fs.pathExists(metadataPath)) {
      const metadata = await fs.readJson(metadataPath);
      fileCount = metadata.length;
      totalSize = metadata.reduce((sum, file) => sum + file.size, 0);
    }
    
    res.json({
      success: true,
      totalSize,
      fileCount,
      formattedSize: formatBytes(totalSize)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '스토리지 정보를 불러올 수 없습니다.' });
  }
});

// 댓글 API

// 댓글 목록 조회 API
app.get('/api/comments/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const commentsPath = path.join(__dirname, 'comments.json');
    let comments = [];
    
    if (await fs.pathExists(commentsPath)) {
      const allComments = await fs.readJson(commentsPath);
      comments = allComments.filter(comment => comment.fileId == parseFloat(fileId));
    }
    
    // 비밀번호 제거 후 반환
    const safeComments = comments.map(comment => {
      const { password, ...safeComment } = comment;
      return safeComment;
    });
    
    res.json({ success: true, comments: safeComments });
  } catch (error) {
    console.error('Comments load error:', error);
    res.status(500).json({ success: false, message: '댓글을 불러올 수 없습니다.' });
  }
});

// 댓글 작성 API
app.post('/api/comments', async (req, res) => {
  try {
    const { fileId, author, password, content } = req.body;
    
    if (!fileId || !password || !content) {
      return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    }
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newComment = {
      id: Date.now() + Math.random(),
      fileId: parseFloat(fileId),
      author: author || '익명',
      password: hashedPassword,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    
    const commentsPath = path.join(__dirname, 'comments.json');
    let comments = [];
    
    if (await fs.pathExists(commentsPath)) {
      comments = await fs.readJson(commentsPath);
    }
    
    comments.push(newComment);
    await fs.writeJson(commentsPath, comments, { spaces: 2 });
    
    // 비밀번호 제거 후 반환
    const { password: _, ...safeComment } = newComment;
    res.json({ success: true, comment: safeComment });
  } catch (error) {
    console.error('Comment create error:', error);
    res.status(500).json({ success: false, message: '댓글 작성에 실패했습니다.' });
  }
});

// 댓글 수정 API
app.put('/api/comments/:id', async (req, res) => {
  try {
    const commentId = req.params.id;
    const { password, content } = req.body;
    
    if (!password || !content) {
      return res.status(400).json({ success: false, message: '비밀번호와 내용을 입력해주세요.' });
    }
    
    const commentsPath = path.join(__dirname, 'comments.json');
    
    if (!(await fs.pathExists(commentsPath))) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    
    let comments = await fs.readJson(commentsPath);
    const commentIndex = comments.findIndex(c => c.id == commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    
    const comment = comments[commentIndex];
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, comment.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    
    // 댓글 수정
    comments[commentIndex].content = content.trim();
    comments[commentIndex].updatedAt = new Date().toISOString();
    
    await fs.writeJson(commentsPath, comments, { spaces: 2 });
    
    res.json({ success: true, message: '댓글이 수정되었습니다.' });
  } catch (error) {
    console.error('Comment update error:', error);
    res.status(500).json({ success: false, message: '댓글 수정에 실패했습니다.' });
  }
});

// 댓글 삭제 API
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const commentId = req.params.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, message: '비밀번호를 입력해주세요.' });
    }
    
    const commentsPath = path.join(__dirname, 'comments.json');
    
    if (!(await fs.pathExists(commentsPath))) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    
    let comments = await fs.readJson(commentsPath);
    const commentIndex = comments.findIndex(c => c.id == commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    
    const comment = comments[commentIndex];
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, comment.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    
    // 댓글 삭제
    comments.splice(commentIndex, 1);
    await fs.writeJson(commentsPath, comments, { spaces: 2 });
    
    res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Comment delete error:', error);
    res.status(500).json({ success: false, message: '댓글 삭제에 실패했습니다.' });
  }
});

// 유틸리티 함수
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.listen(PORT, () => {
  console.log(`🚀 개인 클라우드 저장소 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`📁 업로드 디렉토리: ${UPLOAD_DIR}`);
  console.log(`🔒 관리자 페이지 비밀번호: CloudMaster2024!@#$%^&*()_+{}|:<>?[]\\;\',./'`);
  console.log(`⌨️  Alt + L 키를 눌러 관리자 페이지에 접근하세요!`);
}); 