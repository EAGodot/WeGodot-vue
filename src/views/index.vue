<template>
  <div>
    <!-- 首页图片 -->
    <div
      style="animation: header-effect 2s"
      :style="{ background: `${$store.state.changeBg}` }"
      class="background-image background-image-changeBg"
    ></div>

    <!-- 首页文字 -->
    <div class="signature-wall myCenter my-animation-hideToShow">
      <h1 class="playful">
        <span
          v-for="(a, index) in $store.state.webInfo.webTitle"
          :key="index"
          >{{ a }}</span
        >
      </h1>

      <div class="printer" @click="getGuShi()">
        <printer :printerInfo="printerInfo">
          <template slot="paper" slot-scope="scope">
            <h3>{{ scope.content }}<span class="cursor">|</span></h3>
          </template>
        </printer>
      </div>

      <!-- 波浪分隔线 -->
      <section class="main-hero-waves-area waves-area">
        <svg
          class="waves-svg"
          xmlns="http://www.w3.org/2000/svg"
          xlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shape-rendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"
            ></path>
          </defs>
          <g class="parallax">
            <use href="#gentle-wave" x="48" y="0"></use>
            <use href="#gentle-wave" x="48" y="3"></use>
            <use href="#gentle-wave" x="48" y="5"></use>
            <use href="#gentle-wave" x="48" y="7"></use>
          </g>
        </svg>
      </section>

      <i
        class="el-icon-arrow-down"
        @click="navigation('.markdown-preview-section')"
      ></i>
    </div>
    
    <!-- Markdown 预览区域 -->
    <div class="markdown-preview-section page-container-wrap">
      <div class="page-container">
        <!-- 垂直布局容器 -->
        <div class="markdown-vertical-layout">
          <!-- 文档列表区域 -->
          <div class="document-list-section">
            <div class="section-header">
              <h2>Markdown 文档列表</h2>
              <div class="document-actions">
                <el-button 
                  size="small" 
                  @click="reloadLatestDocument"
                  :loading="loadingContent"
                >
                  <i class="el-icon-refresh"></i> 刷新最新
                </el-button>
                <el-button 
                  size="small" 
                  @click="downloadDocument(currentDocument)"
                  v-if="currentDocument && currentDocument.file_url"
                >
                  <i class="el-icon-download"></i> 下载
                </el-button>
              </div>
            </div>
            <div v-if="loadingDocuments" class="loading">加载中...</div>
            <div v-else class="document-items">
              <div 
                v-for="doc in markdownDocuments" 
                :key="doc.id"
                class="document-item"
                :class="{ 
                  active: currentDocument && currentDocument.id === doc.id,
                  latest: isLatestDocument(doc)
                }"
                @click="loadMarkdownDocument(doc)"
              >
                <div class="document-title">
                  {{ doc.title }}
                  <span v-if="isLatestDocument(doc)" class="latest-badge">最新</span>
                </div>
                <div class="document-meta">
                  {{ formatDate(doc.created_at) }}
                  <span v-if="!doc.is_previewable" class="no-preview">(不可预览)</span>
                </div>
              </div>
              <div v-if="markdownDocuments.length === 0" class="empty-state">
                暂无 Markdown 文档
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div class="preview-section">


            <div class="section-header">   
              <div class="preview-info" v-if="currentDocument">
                <span class="document-name">{{ currentDocument.title }}</span>
                <span class="document-meta-info">
                  {{ formatDate(currentDocument.created_at) }}
                  <span v-if="isLatestDocument(currentDocument)" class="latest-indicator">
                    • 最新发布
                  </span>
                </span>
              </div>
            </div>
            
            <!-- Markdown 预览器 -->
            <div class="markdown-preview-container">
              <div v-if="loadingContent" class="loading-content">
                <i class="el-icon-loading"></i> 加载文档内容...
              </div>
              
              <mavon-editor 
                v-else-if="currentDocument && currentDocument.content"
                v-model="currentDocument.content"
                :subfield="false"
                :toolbarsFlag="false"
                :editable="false"
                defaultOpen="preview"
                :boxShadow="false"
                :ishljs="true"
                class="markdown-preview"
              />
              
              <div v-else class="no-content">
                <div v-if="currentDocument && !currentDocument.is_previewable" class="error-message">
                  <i class="el-icon-warning"></i>
                  <p>此文档不允许预览</p>
                </div>
                <div v-else class="placeholder">
                  <i class="el-icon-document"></i>
                  <p>请从上方列表选择要预览的文档</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import live2d from "vue-live2d";
const printer = () => import("./common/printer");
const articleList = () => import("./articleList");
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

export default {
  name: 'MarkdownViewer',
  components: {
    printer,
    articleList,
    live2d,
    mavonEditor,
  },
  data() {
    return {
      loading: false,
      printerInfo: "咦，这个地方是用来干什么的？",
      pagination: {
        current: 1,
        size: 10,
        total: 0,
        searchKey: "",
        sortId: null,
      },
      guShi: {
        content: "",
        origin: "",
        author: "",
        category: "",
      },
      
      // Markdown 相关数据
      markdownDocuments: [], // 文档列表
      currentDocument: null, // 当前选中的文档
      loadingDocuments: false, // 文档列表加载状态
      loadingContent: false, // 文档内容加载状态
      
      articles: [],
      recommendArticles: [],
      direction: "right",
      style: "",
      size: 210,
      tips: {
        mouseover: [
          {
            selector: ".vue-live2d",
            texts: [],
          },
        ],
      },
      parentLoadingMark: false,
    };
  },
  beforeRouteEnter(to, from, next) {
    if (from.path === "/") {
      next((vm) => {
        vm.parentLoadingMark = true;
      });
    } else {
      next();
    }
  },
  created() {
    this.getGuShi();
    this.loadMarkdownDocuments(); // 加载文档列表
  },
  mounted() {
    // 添加调试代码 - 检查背景状态
    console.log('当前背景:', this.$store.state.changeBg)
    const bgElement = document.querySelector('.background-image-changeBg')
    console.log('元素样式:', window.getComputedStyle(bgElement).backgroundImage)

    this.scrollTo();
  },
  methods: {
    // 加载 Markdown 文档列表
    async loadMarkdownDocuments() {
      this.loadingDocuments = true;
      try {
        const response = await this.$http.get(this.$constant.baseURL + "/markdown/list/");
        if (response.success) {
          // 按创建时间降序排序，最新的在前面
          this.markdownDocuments = response.data.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });
          
          // 自动加载最新发布的文档
          this.loadLatestDocument();
        } else {
          this.$notify({
            type: "error",
            title: "加载失败",
            message: response.error || "无法加载文档列表",
            position: "top-left",
            offset: 50,
          });
        }
      } catch (error) {
        this.$notify({
          type: "error",
          title: "加载失败",
          message: error.message,
          position: "top-left",
          offset: 50,
        });
      } finally {
        this.loadingDocuments = false;
      }
    },
    
    // 自动加载最新发布的文档
    async loadLatestDocument() {
      if (this.markdownDocuments.length === 0) {
        return;
      }
      
      // 查找第一个可预览的文档
      const previewableDocuments = this.markdownDocuments.filter(doc => doc.is_previewable);
      if (previewableDocuments.length === 0) {
        this.$notify({
          type: "warning",
          title: "提示",
          message: "暂无可以预览的文档",
          position: "top-left",
          offset: 50,
        });
        return;
      }
      
      // 选择最新的可预览文档
      const latestDocument = previewableDocuments[0];
      await this.loadMarkdownDocument(latestDocument);
    },
    
    // 加载单个 Markdown 文档内容
    async loadMarkdownDocument(document) {
      // 检查文档是否允许预览
      if (!document.is_previewable) {
        this.$notify({
          type: "warning",
          title: "提示",
          message: "此文档不允许预览",
          position: "top-left",
          offset: 50,
        });
        return;
      }
      
      this.loadingContent = true;
      this.currentDocument = document;
      
      try {
        const response = await this.$http.get(
          this.$constant.baseURL + `/markdown/content/${document.id}/`
        );
        
        if (response.success) {
          // 更新当前文档的内容
          this.currentDocument.content = response.data.content;
          
          // 显示成功通知
          this.$notify({
            type: "success",
            title: "加载成功",
            message: `已加载文档: ${document.title}`,
            position: "top-left",
            offset: 50,
            duration: 2000
          });
        } else {
          this.$notify({
            type: "error",
            title: "加载失败",
            message: response.error || "无法加载文档内容",
            position: "top-left",
            offset: 50,
          });
          this.currentDocument.content = "# 加载失败\n\n无法获取文档内容。";
        }
      } catch (error) {
        this.$notify({
          type: "error",
          title: "加载失败",
          message: error.message,
          position: "top-left",
          offset: 50,
        });
        this.currentDocument.content = "# 加载失败\n\n" + error.message;
      } finally {
        this.loadingContent = false;
      }
    },
    
    // 重新加载最新文档
    reloadLatestDocument() {
      if (this.markdownDocuments.length > 0) {
        const previewableDocuments = this.markdownDocuments.filter(doc => doc.is_previewable);
        if (previewableDocuments.length > 0) {
          const latestDocument = previewableDocuments[0];
          this.loadMarkdownDocument(latestDocument);
        }
      }
    },
    
    // 下载文档
    downloadDocument(document) {
      if (document && document.file_url) {
        window.open(document.file_url, '_blank');
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    // 判断是否为最新文档
    isLatestDocument(document) {
      if (!document || this.markdownDocuments.length === 0) return false;
      const previewableDocuments = this.markdownDocuments.filter(doc => doc.is_previewable);
      return previewableDocuments.length > 0 && document.id === previewableDocuments[0].id;
    },
    
    navigation(selector) {
      let pageId = document.querySelector(selector);
      if (pageId) {
        window.scrollTo({
          top: pageId.offsetTop,
          behavior: "smooth",
        });
      }
    },
    
    getGuShi() {
      let that = this;
      let xhr = new XMLHttpRequest();
      xhr.open("get", this.$constant.jinrishici);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          that.guShi = JSON.parse(xhr.responseText);
          that.printerInfo = that.guShi.content;
        }
      };
      xhr.send();
    },
    
    scrollTo() {
      let content = document.querySelector(".content");
      if (content) {
        content.addEventListener("wheel", (event) => {
          event.preventDefault();
          content.scrollLeft += event.deltaY;
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// Markdown 预览区域布局
.markdown-preview-section {
  background: var(--background);
  position: relative;
  padding-top: 40px;
}

.page-container {
  display: flex;
  justify-content: flex-start; /* 改为左对齐 */
  width: 100%;
  padding: 0 130px 40px 130px;
  flex-direction: row;
}

// 垂直布局容器
.markdown-vertical-layout {
  width: 100%;
  display: flex;
  flex-direction: column; /* 垂直布局 */
  gap: 30px;
  align-items: flex-start; /* 左对齐 */
}

// 文档列表区域
.document-list-section {
  width: 100%;
  background: var(--card-background);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--border-color);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;



    h2 {
      color: var(--fontColor);
      font-size: 20px;
      margin: 0;
      font-weight: 600;
    }
    
    .document-actions {
      display: flex;
      gap: 10px;
      margin-left: -10px;
    }
  }
}

// 预览区域
.preview-section {
  width: 100%;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      color: var(--fontColor);
      font-size: 20px;
      margin: 0;
      font-weight: 600;
    }
    
    .preview-info {
      display: flex;
      flex-direction: row ;

      justify-content: flex-start;
      align-items: flex-end;
      gap: 10px;
      margin-left: 50px;  // 左侧留出 20px 空白
      
      .document-name {
        color: var(--fontColor);
        font-weight: 500;
        font-size: 24px;
      }
      
      .document-meta-info {
        font-size: 12px;
        color: var(--text-muted);
        
        .latest-indicator {
          color: var(--orange);
          font-weight: 500;
        }
      }
    }
  }
}

.document-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
}

.document-item {
  padding: 15px;
  background: var(--background);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid var(--blue);
  border: 1px solid var(--border-color);
  
  &:hover {
    background: var(--blue24);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    background: var(--blue24);
    border-left-color: var(--red);
    border-color: var(--red);
  }
  
  &.latest {
    border-left-color: var(--orange);
  }
}

.document-title {
  color: var(--fontColor);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .latest-badge {
    background: var(--orange);
    color: white;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: bold;
    margin-left: 8px;
    flex-shrink: 0;
  }
}

.document-meta {
  font-size: 12px;
  color: var(--text-muted);
  
  .no-preview {
    color: var(--red);
    font-weight: 500;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  grid-column: 1 / -1;
}

.markdown-preview-container {
  background: var(--card-background);
  color: var(--fontColor);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--border-color);
  min-height: 600px;
}

.loading-content {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  
  .el-icon-loading {
    font-size: 24px;
    margin-bottom: 10px;
  }
}

.no-content {
  text-align: center;
  padding: 60px 20px;
  
  .error-message {
    color: var(--red);
    
    .el-icon-warning {
      font-size: 48px;
      margin-bottom: 15px;
    }
  }
  
  .placeholder {
    color: var(--text-muted);
    
    .el-icon-document {
      font-size: 48px;
      margin-bottom: 15px;
    }
  }
}

.markdown-preview {
  border: none !important;
  min-height: 500px;
  
  ::v-deep .v-note-wrapper {
    border: none !important;
    box-shadow: none !important;
  }
  
  ::v-deep .v-show-content {
    background: var(--background) !important;
    color: var(--fontColor) !important;
  }

  ::v-deep .v-show-content .markdown-body {
    color: var(--fontColor) !important;
  }
}

// 响应式设计
@media screen and (max-width: 1278px) {
  .page-container {
    padding: 0 40px 40px;
  }
}

@media screen and (max-width: 1100px) {
  .page-container {
    padding: 0 40px 40px;
  }
}

@media screen and (max-width: 1000px) {
  .page-container {
    padding: 0 30px 30px;
  }
  
  .document-items {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
  .playful {
    font-size: 30px;
  }
  
  .page-container {
    padding: 0 20px 20px;
  }
  
  .markdown-vertical-layout {
    gap: 20px;
  }
  
  .document-list-section,
  .preview-section .section-header {
    padding: 20px;
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      



      .document-actions,
      .preview-info {
        width: 100%;

      }
      
      .document-actions {
        justify-content: flex-start;
      }
    }
  }
  
    .document-name {
      justify-content: flex-start;
      margin-left: -30px;
    }



  .document-items {
    grid-template-columns: 1fr;
    max-height: 300px;
  }
  
  .markdown-preview-container {
    padding: 20px;
    min-height: 500px;
  }
  
  .markdown-preview {
    min-height: 450px;
    
    ::v-deep .v-note-wrapper {
      min-height: 450px !important;
    }
  }
}

/* 小屏幕手机优化 */
@media screen and (max-width: 480px) {
  .page-container {
    padding: 0 15px 15px;
  }
  
  .document-list-section,
  .preview-section .section-header {
    padding: 15px;
  }
  
  .document-item {
    padding: 12px;
  }
  
  .markdown-preview-container {
    padding: 15px;
    min-height: 400px;
  }
  
  .markdown-preview {
    min-height: 370px;
    
    ::v-deep .v-note-wrapper {
      min-height: 370px !important;
    }
  }
  
  .section-header h2 {
    font-size: 18px;
  }
}

// 原有的其他样式保持不变
.main-hero-waves-area {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: -11px;
  z-index: 5;
  .waves-svg {
    width: 100%;
    height: 60px;
    .parallax > use:nth-child(1) {
      animation-delay: -2s;
      animation-duration: 7s;
      fill: var(--background);
      opacity: 0.5;
    }
    .parallax > use:nth-child(2) {
      animation-delay: -3s;
      animation-duration: 10s;
      fill: var(--background);
      opacity: 0.6;
    }
    .parallax > use:nth-child(3) {
      animation-delay: -4s;
      animation-duration: 13s;
      fill: var(--background);
      opacity: 0.7;
    }
    .parallax > use:nth-child(4) {
      animation-delay: -5s;
      animation-duration: 20s;
      fill: var(--background);
    }
    .parallax > use {
      animation: move-forever 30s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
    }
  }
}

// ... 其他原有样式保持不变
.live2d {
  position: fixed;
  z-index: 100;
  bottom: -0.8rem;
}
.signature-wall {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  height: 100vh;
  overflow: hidden;
}
.playful {
  color: var(--red);
  font-size: 40px;
}
.printer {
  color: var(--darkBlue);
  background: var(--background);
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
.cursor {
  margin-left: 1px;
  animation: hideToShow 0.7s infinite;
  font-weight: 200;
}
.el-icon-arrow-down {
  font-size: 40px;
  font-weight: bold;
  color: var(--white);
  position: absolute;
  bottom: 60px;
  animation: my-shake 1.5s ease-out infinite;
  z-index: 15;
}
.page-container-wrap {
  background: var(--background);
  position: relative;
}
.recent-posts {
  width: calc(100% - 310px);
}
.announcement {
  padding: 22px;
  border: 1px dashed var(--red);
  color: var(--bigRed1);
  border-radius: 10px;
  display: flex;
  max-width: 1080px;
  margin: 40px auto 40px;
  i {
    color: var(--red);
    font-size: 22px;
    margin: auto 0;
    animation: scale 0.8s ease-in-out infinite;
  }
  div div {
    width: 100%;
    margin-left: 20px;
    line-height: 30px;
  }
}
.aside-content {
  user-select: none;
  margin-top: 40px;
  margin-left: 10px;
  width: 300px;
  float: left;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.pagination {
  padding: 13px 15px;
  border: 1px solid var(--red2);
  border-radius: 3rem;
  color: var(--red1);
  width: 100px;
  user-select: none;
  text-align: center;
  &:hover {
    border: 1px solid var(--blue2);
    color: var(--orange2);
    box-shadow: 0 0 5px var(--blue2);
  }
}
.content {
  border-radius: 11px;
  position: relative;
  max-width: 1080px;
  margin: 20px auto 40px;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
}
.page {
  border-radius: 12px;
  margin-left: 8px;
  width: 200px;
  height: 186px;
  flex-shrink: 0;
  border: 2px solid var(--myAsideBorderColor);
  transition: all 1s;
  &:hover {
    transform: scale(0.95);
    background-color: var(--blue);
    transition-duration: 0.4s;
    border-color: var(--myAsideBorderColor1);
    span {
      color: var(--black1);
    }
  }
}
.category_group {
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 200px;
  height: 186px;
}
.category_item {
  background: linear-gradient(to right, var(--blue24), var(--blue11));
  overflow: hidden;
  height: 48%;
  border-radius: 12px;
  transition: all 1s;
  &:hover {
    transform: scale(0.95);
    transition-duration: 0.4s;
  }
  &.item {
    background: linear-gradient(to right, var(--blue22), var(--blue12));
  }
}
.category_button {
  text-decoration: none;
  height: 100%;
  width: 100%;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
  line-height: 4em;
  font-weight: 800;
  font-size: 20px;
  color: var(--white);
  overflow: hidden;
  &_text {
    padding: 20px;
    background: linear-gradient(to right, var(--red), var(--green1)) no-repeat
      right bottom;
    background-size: 0px 3px;
    transition: background-size 1300ms;
    &:hover {
      background-position-x: left;
      background-size: 100% 3px;
    }
  }
}
.category_buttons::before {
  line-height: 60px;
  content: "推荐";
  position: absolute;
  z-index: 2;
  color: var(--white);
  top: -15px;
  letter-spacing: 3px;
  left: 140px;
  font-size: 15px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  background: linear-gradient(90deg, var(--orange), var(--orange6));
  border-radius: 0px 0px 12px 12px;
}
.post_cover {
  width: 100%;
  height: 130px;
  position: relative;
  > a {
    text-decoration: none;
    display: block;
  }
  img {
    border-radius: 12px;
    object-fit: cover;
    width: 100%;
    height: 130px;
  }
}
.post_info {
  padding: 6px 9px;
}
.article-title {
  color: var(--fontColor);
  -webkit-line-clamp: 2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  font-size: 15px;
  padding: 0;
}
@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}
</style>