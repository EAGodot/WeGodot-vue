<template>
  <div class="blog-editor-container">
    <!-- 顶部操作栏 -->
    <div class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="handleBack">
          <i class="icon-back">←</i> 返回
        </button>
        <h1 class="editor-title">{{ isEditing ? '编辑博客' : '新建博客' }}</h1>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="handleSaveDraft">
          保存草稿
        </button>
        <button class="btn btn-primary" :disabled="!isFormValid" @click="handlePublish">
          {{ isEditing ? '更新博客' : '发布博客' }}
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="editor-main">
      <!-- 左侧编辑区域 -->
      <div class="editor-panel">
        <!-- 封面图片 -->
        <div class="form-section">
          <label class="form-label">博客封面</label>
          <div class="cover-upload-area" @click="triggerCoverInput">
            <input
              ref="coverInput"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleCoverUpload"
            />
            <div v-if="!formData.cover_image" class="cover-placeholder">
              <div class="cover-icon">🖼️</div>
              <p>点击上传封面图片</p>
              <p class="cover-hint">建议尺寸：1200×600像素</p>
            </div>
            <div v-else class="cover-preview">
              <img :src="getCoverImageUrl" alt="封面预览" class="cover-image" />
              <div class="cover-actions">
                <button class="cover-btn" @click.stop="triggerCoverInput">更换</button>
                <button class="cover-btn delete" @click.stop="removeCover">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">博客标题 *</label>
            <input
              v-model="formData.title"
              type="text"
              class="form-input title-input"
              placeholder="请输入博客标题..."
              maxlength="100"
            />
            <div class="char-count">{{ formData.title.length }}/100</div>
          </div>
        </div>

        <!-- 标签管理 -->
        <div class="form-section">
          <label class="form-label">标签</label>
          <div class="tags-container">
            <span
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="tag"
            >
              {{ tag }}
              <span class="tag-remove" @click="removeTag(index)">×</span>
            </span>
            <input
              v-model="newTag"
              class="tag-input"
              placeholder="输入标签..."
              @keydown.enter="addTag"
            />
          </div>
        </div>

        <!-- 内容编辑器 -->
        <div class="form-section">
          <label class="form-label">博客内容 *</label>

          <div class="editor-toolbar">
            <!-- 字体样式 -->
            <div class="toolbar-group">
              <label class="tool-label">字号:</label>
              <select v-model="selectedFontSize" class="tool-select" @change="applyFontSize">
                <option value="">默认</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
            </div>

            <!-- 新增：行间距控件 -->
            <div class="toolbar-group">
              <label class="tool-label">行间距:</label>
              <select v-model="selectedLineHeight" class="tool-select" @change="applyLineHeight">
                <option value="">默认</option>
                <option value="1">单倍</option>
                <option value="1.2">1.2倍</option>
                <option value="1.5">1.5倍</option>
                <option value="1.8">1.8倍</option>
                <option value="2">双倍</option>
                <option value="2.5">2.5倍</option>
              </select>
            </div>

            <div class="toolbar-group">
              <label class="tool-label">颜色:</label>
              <div class="color-picker">
                <input 
                  type="color" 
                  v-model="selectedColor" 
                  @change="applyColor"
                  class="color-input"
                >
                <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
              </div>
            </div>

            <div class="toolbar-divider"></div>
            
            <!-- 文本格式 -->
            <button class="tool-btn" @click="formatText('bold')" title="加粗">
              <b>B</b>
            </button>
            <button class="tool-btn" @click="formatText('italic')" title="斜体">
              <i>I</i>
            </button>
            <button class="tool-btn" @click="formatText('underline')" title="下划线">
              <u>U</u>
            </button>

            <div class="toolbar-divider"></div>

            <!-- 段落对齐 -->
            <div class="toolbar-group">
              <label class="tool-label">对齐:</label>
              <div class="alignment-buttons">
                <button class="tool-btn" @click="applyAlignment('left')" title="左对齐">
                  ☰
                </button>
                <button class="tool-btn" @click="applyAlignment('center')" title="居中对齐">
                  ☰
                </button>
                <button class="tool-btn" @click="applyAlignment('right')" title="右对齐">
                  ☰
                </button>
                <button class="tool-btn" @click="applyAlignment('justify')" title="两端对齐">
                  ☰
                </button>
              </div>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 多级标题 - 修复：将正文放在最后 -->
            <div class="toolbar-group">
              <label class="tool-label">标题:</label>
              <select v-model="selectedHeading" class="tool-select" @change="applyHeading">
                <option value="h1">标题1</option>
                <option value="h2">标题2</option>
                <option value="h3">标题3</option>
                <option value="h4">标题4</option>
                <option value="h5">标题5</option>
                <option value="h6">标题6</option>
                <option value="">正文</option>
              </select>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 图片插入功能 -->
            <button class="tool-btn" @click="openImageModal" title="插入图片">
              🖼️
            </button>

            <div class="toolbar-divider"></div>

            <!-- 其他功能 -->
            <button class="tool-btn" @click="insertElement('blockquote')" title="引用">
              ❝
            </button>
            <button class="tool-btn" @click="insertElement('code')" title="代码块">
              &lt;/&gt;
            </button>
            <button class="tool-btn" @click="insertElement('link')" title="链接">
              🔗
            </button>
            <button class="tool-btn" @click="clearFormat" title="清除格式">
              🧹
            </button>
          </div>

          <div
            ref="editorElement"
            class="editor-content"
            contenteditable="true"
            @input="handleContentChange"
            @focus="ensureDefaultStyle"
            @click="handleEditorClick"
            @keyup="handleEditorKeyup"
          ></div>
        </div>
      </div>

      <!-- 右侧预览/设置区域 -->
      <div class="sidebar-panel">
        <!-- 发布设置 -->
        <div class="settings-card">
          <h3 class="settings-title">发布设置</h3>
          
          <div class="setting-item">
            <label class="setting-label">分类</label>
            <select v-model="formData.category" class="form-select">
              <option value="">选择分类</option>
              <option value="technology">技术</option>
              <option value="life">生活</option>
              <option value="design">设计</option>
              <option value="other">其他</option>
            </select>
          </div>


          <!-- 
          <div class="setting-item">
            <label class="setting-label">可见性</label>
            <div class="radio-group">
              <label class="radio-label">
                <input
                  v-model="formData.visibility"
                  type="radio"
                  value="public"
                  class="radio-input"
                />
                <span class="radio-text">公开</span>
              </label>
              <label class="radio-label">
                <input
                  v-model="formData.visibility"
                  type="radio"
                  value="private"
                  class="radio-input"
                />
                <span class="radio-text">私密</span>
              </label>
            </div>
          </div>
          -->


        </div>

        <!-- 实时预览 -->
        <div class="preview-card">
          <h3 class="preview-title">实时预览</h3>
          <div class="preview-content">
            <article class="blog-preview">
              <!-- 封面预览 -->
              <div v-if="formData.cover_image" class="preview-cover">
                <img :src="getCoverImageUrl" alt="封面" class="cover-preview-img" />
              </div>
              <h1 class="preview-title">{{ formData.title || '未命名博客' }}</h1>
              <div class="preview-meta">
                <span class="meta-item">发布于: {{ currentTime }}</span>
                <span class="meta-item">阅读时间: {{ readingTime }}分钟</span>
              </div>
              <div v-if="formData.tags.length" class="preview-tags">
                <span
                  v-for="tag in formData.tags"
                  :key="tag"
                  class="preview-tag"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="preview-body" v-html="formData.content"></div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片插入模态框 - 简化版 -->
    <div v-if="showImageModal" class="modal-overlay" @click="showImageModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>插入图片</h3>
          <button class="modal-close" @click="showImageModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="tab-buttons">
            <button 
              class="tab-btn" 
              :class="{ active: imageTab === 'upload' }"
              @click="imageTab = 'upload'"
            >
              本地上传
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: imageTab === 'url' }"
              @click="imageTab = 'url'"
            >
              网络图片
            </button>
          </div>

          <!-- 本地上传 - 简化版 -->
          <div v-if="imageTab === 'upload'" class="tab-content">
            <div class="upload-area" @click="triggerFileInput">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="file-input"
                @change="handleFileUpload"
              />
              <div class="upload-placeholder">
                <div class="upload-icon">📁</div>
                <p>点击选择图片</p>
                <p class="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</p>
              </div>
            </div>
          </div>

          <!-- 网络图片 -->
          <div v-if="imageTab === 'url'" class="tab-content">
            <div class="url-input-group">
              <label class="input-label">图片URL</label>
              <input
                v-model="imageUrl"
                type="url"
                class="url-input"
                placeholder="请输入图片链接地址..."
                @keyup.enter="insertImageFromUrl"
              />
              <div class="url-preview" v-if="imageUrl && isImageUrl(imageUrl)">
                <img :src="imageUrl" alt="预览" class="url-preview-img" />
                <p class="preview-text">图片预览</p>
              </div>
              <div v-else-if="imageUrl" class="url-error">
                请输入有效的图片URL
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showImageModal = false">取消</button>
          <button 
            v-if="imageTab === 'url' && imageUrl && isImageUrl(imageUrl)" 
            class="btn btn-primary" 
            @click="insertImageFromUrl"
          >
            插入图片
          </button>
        </div>
      </div>
    </div>

    <!-- 图片操作工具栏 - 下方显示 -->
    <div v-if="selectedImage && showImageToolbar" class="image-toolbar" :style="imageToolbarStyle">
      <div class="image-tool-section">
        <span class="image-tool-label">大小调整:</span>
        <div class="image-tool-group">
          <button class="image-tool-btn" @click.stop="resizeImage(1.1)" title="放大">
            <span class="tool-icon">+</span>
            <span class="tool-text">放大</span>
          </button>
          <button class="image-tool-btn" @click.stop="resizeImage(0.9)" title="缩小">
            <span class="tool-icon">-</span>
            <span class="tool-text">缩小</span>
          </button>
        </div>
      </div>
      
      <div class="image-tool-section">
        <span class="image-tool-label">对齐方式:</span>
        <div class="image-tool-group">
          <button class="image-tool-btn" @click.stop="alignImage('left')" title="左对齐">
            <span class="tool-icon">☰</span>
            <span class="tool-text">左对齐</span>
          </button>
          <button class="image-tool-btn" @click.stop="alignImage('center')" title="居中对齐">
            <span class="tool-icon">☰</span>
            <span class="tool-text">居中</span>
          </button>
          <button class="image-tool-btn" @click.stop="alignImage('right')" title="右对齐">
            <span class="tool-icon">☰</span>
            <span class="tool-text">右对齐</span>
          </button>
        </div>
      </div>
      
      <button class="image-tool-btn delete" @click.stop="deleteSelectedImage" title="删除图片">
        <span class="tool-icon">×</span>
        <span class="tool-text">删除</span>
      </button>
    </div>

    <!-- 状态提示 -->
    <div
      v-if="status.message"
      class="status-toast"
      :class="`status-${status.type}`"
    >
      {{ status.message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'BlogEditor',
  data() {
    return {
      formData: {
        title: '',
        summary: '',
        content: '',
        tags: [],
        category: 'technology',
        visibility: 'public',
        cover_image: '',
        coverFile: null,
        status: 'draft'
      },
      newTag: '',
      status: {
        message: '',
        type: ''
      },
      selectedFontSize: '',
      selectedColor: '#000000',
      selectedHeading: '',
      selectedLineHeight: '',
      
      // 图片相关数据
      showImageModal: false,
      imageTab: 'upload',
      imageUrl: '',
      
      // 图片操作相关数据
      selectedImage: null,
      selectedImageContainer: null,
      showImageToolbar: false,
      imageToolbarStyle: {
        bottom: '20px',
        left: '50%'
      },
      
      // 保存当前光标位置
      currentRange: null,
      lastSelection: null
    }
  },
  computed: {
    isFormValid() {
      return this.formData.title.trim() && this.formData.content.trim()
    },
    isEditing() {
      return !!this.$route.query.id
    },
    currentTime() {
      return new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    readingTime() {
      const words = this.formData.content.replace(/<[^>]*>/g, '').length
      return Math.max(1, Math.ceil(words / 200))
    },
    getCoverImageUrl() {
      if (!this.formData.cover_image) return ''
      
      if (this.formData.cover_image.startsWith('data:')) {
        return this.formData.cover_image
      }
      
      if (this.formData.cover_image.startsWith('/')) {
        return this.$constant.baseURL + this.formData.cover_image
      }
      
      return this.formData.cover_image
    }
  },




  mounted() {
    this.initializeEditor()
    console.log('博客编辑器已加载，查询参数:', this.$route.query)
    
    // 检查是否是编辑模式且有传递的数据
    if (this.isEditing && this.$route.query.id) {
      this.handleEditMode()
    } else {
      // 新建模式：加载草稿
      this.loadDraftData()
    }
    
    document.addEventListener('click', this.handleGlobalClick)
    document.addEventListener('selectionchange', this.handleSelectionChange)
  },





  beforeDestroy() {
    document.removeEventListener('click', this.handleGlobalClick)
    document.removeEventListener('selectionchange', this.handleSelectionChange)
  },



  methods: {

    // 新增：处理编辑模式
    async handleEditMode() {
      const blogId = this.$route.query.id
      const source = this.$route.query.source
      
      console.log(`🔄 编辑模式处理，来源: ${source}, ID: ${blogId}`)
      
      if (source === 'list') {
        // 从列表直接传递数据
        const success = this.loadBlogFromStorage(blogId)
        if (!success) {
          // 如果存储数据加载失败，回退到API请求
          console.log('❌ 存储数据加载失败，回退到API请求')
          await this.loadBlogFromAPI(blogId)
        }
      } else {
        // 直接通过URL进入编辑页面，使用API加载
        await this.loadBlogFromAPI(blogId)
      }
    },


    // 新增：从 sessionStorage 加载博客数据
    loadBlogFromStorage(blogId) {
      try {
        const storageKey = `blog_edit_data_${blogId}`
        const expiryKey = `${storageKey}_expiry`
        
        // 检查数据是否过期
        const expiryTime = sessionStorage.getItem(expiryKey)
        if (expiryTime && Date.now() > parseInt(expiryTime)) {
          console.log('❌ 存储数据已过期')
          this.cleanupStorageData(blogId)
          return false
        }
        
        const storedData = sessionStorage.getItem(storageKey)
        if (!storedData) {
          console.log('❌ 未找到存储数据')
          return false
        }
        
        const blogData = JSON.parse(storedData)
        console.log('📥 从存储加载博客数据:', blogData.title)
        
        // 填充表单数据
        this.populateFormData(blogData)
        
        // 清理存储数据（避免重复使用）
        this.cleanupStorageData(blogId)
        
        this.showStatus('博客内容加载完成', 'success')
        return true
        
      } catch (error) {
        console.error('从存储加载数据失败:', error)
        this.cleanupStorageData(blogId)
        return false
      }
    },


    // 新增：从API加载博客数据（备用方案）
    async loadBlogFromAPI(blogId) {
      try {
        this.showStatus('正在加载博客内容...', 'info')
        
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/${blogId}/`
        
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
        
        const headers = {
          'Content-Type': 'application/json'
        }
        
        if (token) {
          headers['Authorization'] = `Token ${token}`
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        })
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          const blogData = data.data
          this.populateFormData(blogData)
          this.showStatus('博客内容加载完成', 'success')
        } else {
          throw new Error(data.message || '加载博客内容失败')
        }
      } catch (error) {
        console.error('API加载博客内容失败:', error)
        this.showStatus('加载失败: ' + error.message, 'error')
        
        // 加载失败时回退到新建模式
        this.fallbackToCreateMode()
      }
    },


    // 新增：填充表单数据
    populateFormData(blogData) {
      this.formData = {
        title: blogData.title || '',
        summary: blogData.summary || '',
        content: blogData.content || '',
        tags: blogData.tags || [],
        category: blogData.category || 'technology',
        visibility: blogData.visibility || 'public',
        cover_image: blogData.cover_image || '',
        coverFile: null,
        status: blogData.status || 'draft'
      }
      
      // 设置编辑器内容
      if (this.$refs.editorElement) {
        this.$refs.editorElement.innerHTML = this.formData.content
      }
      
      console.log('✅ 表单数据填充完成:', this.formData.title)
    },

    // 新增：清理存储数据
    cleanupStorageData(blogId) {
      const storageKey = `blog_edit_data_${blogId}`
      const expiryKey = `${storageKey}_expiry`
      
      sessionStorage.removeItem(storageKey)
      sessionStorage.removeItem(expiryKey)
      
      console.log('🧹 已清理存储数据')
    },

    // 新增：回退到新建模式
    fallbackToCreateMode() {
      this.showStatus('加载失败，已切换到新建模式', 'warning')
      this.$router.replace({
        path: '/blogeditor',
        query: { ...this.$route.query, id: undefined, mode: undefined }
      })
      
      // 初始化编辑器
      this.initializeEditor()
    },

    // 修改：加载草稿数据
    loadDraftData() {
      const draft = localStorage.getItem('blog-draft')
      if (draft) {
        try {
          const draftData = JSON.parse(draft)
          this.formData = { ...this.formData, ...draftData }
          if (this.$refs.editorElement) {
            this.$refs.editorElement.innerHTML = this.formData.content
          }
          this.showStatus('已加载自动保存的草稿', 'info')
        } catch (error) {
          console.error('加载草稿失败:', error)
        }
      }
    },



    initializeEditor() {
      if (this.$refs.editorElement) {
        this.$refs.editorElement.innerHTML = `
          <div style="color: #000000; font-size: 16px; line-height: 1.6;">
            <p>开始编写您的博客内容...</p>
          </div>
        `
        this.formData.content = this.$refs.editorElement.innerHTML
      }
    },
    
    ensureDefaultStyle() {
      if (this.$refs.editorElement && !this.$refs.editorElement.innerHTML.trim()) {
        this.$refs.editorElement.innerHTML = `
          <div style="color: #000000; font-size: 16px; line-height: 1.6;">
            <p></p>
          </div>
        `
      }
    },
    
    handleContentChange() {
      if (this.$refs.editorElement) {
        this.formData.content = this.$refs.editorElement.innerHTML
      }
    },
    
    // 保存当前光标位置
    handleSelectionChange() {
      const selection = window.getSelection()
      if (selection.rangeCount > 0 && this.$refs.editorElement && this.$refs.editorElement.contains(selection.anchorNode)) {
        this.currentRange = selection.getRangeAt(0).cloneRange()
        this.lastSelection = {
          anchorNode: selection.anchorNode,
          anchorOffset: selection.anchorOffset,
          focusNode: selection.focusNode,
          focusOffset: selection.focusOffset
        }
      }
    },
    
    // 处理编辑器键盘事件
    handleEditorKeyup() {
      this.handleSelectionChange()
    },
    
    // 新增：打开图片模态框时保存当前光标位置
    openImageModal() {
      // 保存当前光标位置
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        this.currentRange = selection.getRangeAt(0).cloneRange()
        this.lastSelection = {
          anchorNode: selection.anchorNode,
          anchorOffset: selection.anchorOffset,
          focusNode: selection.focusNode,
          focusOffset: selection.focusOffset
        }
      }
      this.showImageModal = true
    },
    
    // 恢复光标位置
    restoreSelection() {
      if (!this.$refs.editorElement) return false
      
      const selection = window.getSelection()
      selection.removeAllRanges()
      
      // 优先使用 currentRange
      if (this.currentRange) {
        try {
          selection.addRange(this.currentRange)
          return true
        } catch (e) {
          console.warn('恢复 currentRange 失败:', e)
        }
      }
      
      // 如果 currentRange 失败，尝试使用 lastSelection
      if (this.lastSelection) {
        try {
          const range = document.createRange()
          range.setStart(this.lastSelection.anchorNode, this.lastSelection.anchorOffset)
          range.setEnd(this.lastSelection.focusNode, this.lastSelection.focusOffset)
          selection.addRange(range)
          return true
        } catch (e) {
          console.warn('恢复 lastSelection 失败:', e)
        }
      }
      
      // 如果都失败，将光标放在编辑器开头
      const range = document.createRange()
      range.selectNodeContents(this.$refs.editorElement)
      range.collapse(true) // 放在开头
      selection.addRange(range)
      return false
    },
    
    formatText(formatType) {
      if (this.$refs.editorElement) {
        this.$refs.editorElement.focus()
        document.execCommand(formatType, false, null)
        this.handleContentChange()
      }
    },
    
    applyAlignment(alignment) {
      if (this.$refs.editorElement) {
        this.$refs.editorElement.focus()
        document.execCommand('justifyLeft', false, null)
        document.execCommand('justifyCenter', false, null)
        document.execCommand('justifyRight', false, null)
        document.execCommand('justifyFull', false, null)
        
        switch (alignment) {
          case 'left':
            document.execCommand('justifyLeft', false, null)
            break
          case 'center':
            document.execCommand('justifyCenter', false, null)
            break
          case 'right':
            document.execCommand('justifyRight', false, null)
            break
          case 'justify':
            document.execCommand('justifyFull', false, null)
            break
        }
        this.handleContentChange()
      }
    },
    
    // 应用字体大小时同时动态调整行高
    applyFontSize() {
      if (this.$refs.editorElement && this.selectedFontSize) {
        this.$refs.editorElement.focus()
        
        const selection = window.getSelection()
        if (selection.rangeCount === 0) {
          this.showStatus('请先选择要设置字体大小的文本', 'warning')
          return
        }
        
        const range = selection.getRangeAt(0)
        
        // 清理外部内容
        this.cleanupExternalContent(range)
        
        if (range.collapsed) {
          const paragraph = this.getCurrentParagraph(range)
          if (paragraph) {
            const newRange = document.createRange()
            newRange.selectNodeContents(paragraph)
            selection.removeAllRanges()
            selection.addRange(newRange)
          } else {
            this.showStatus('请选择要设置字体大小的文本', 'warning')
            return
          }
        }
        
        // 应用字体大小和相应的行高
        this.applyFontSizeToSelection(selection, this.selectedFontSize)
        this.handleContentChange()
        this.showStatus('字体大小设置成功', 'success')
      }
    },
    
    applyFontSizeToSelection(selection, fontSize) {
      const range = selection.getRangeAt(0)
      
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: function(node) {
            if (node.tagName === 'P' || node.tagName === 'DIV' || 
                node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' ||
                node.tagName === 'H4' || node.tagName === 'H5' || node.tagName === 'H6' ||
                node.tagName === 'SPAN') {
              return NodeFilter.FILTER_ACCEPT
            }
            return NodeFilter.FILTER_SKIP
          }
        },
        false
      )
      
      let currentNode
      const nodesToStyle = []
      while (currentNode = walker.nextNode()) {
        if (range.intersectsNode(currentNode)) {
          nodesToStyle.push(currentNode)
        }
      }
      
      if (nodesToStyle.length === 0) {
        const selectedContent = range.extractContents()
        const span = document.createElement('span')
        span.style.fontSize = fontSize
        
        // 动态计算行高 - 根据字体大小自动调整
        const fontSizeNum = parseInt(fontSize)
        const lineHeight = this.calculateLineHeight(fontSizeNum)
        span.style.lineHeight = lineHeight
        
        span.appendChild(selectedContent)
        range.insertNode(span)
      } else {
        nodesToStyle.forEach(node => {
          node.style.fontSize = fontSize
          
          // 动态计算行高 - 根据字体大小自动调整
          const currentFontSize = parseInt(node.style.fontSize) || parseInt(fontSize) || 16
          const lineHeight = this.calculateLineHeight(currentFontSize)
          node.style.lineHeight = lineHeight
        })
      }
      
      selection.removeAllRanges()
      selection.addRange(range)
    },
    
    // 根据字体大小动态计算合适的行高
    calculateLineHeight(fontSize) {
      if (fontSize <= 12) return '1.8'
      if (fontSize <= 14) return '1.7'
      if (fontSize <= 16) return '1.6'
      if (fontSize <= 18) return '1.5'
      if (fontSize <= 20) return '1.4'
      if (fontSize <= 24) return '1.3'
      return '1.2'
    },
    
    applyLineHeight() {
      if (this.$refs.editorElement && this.selectedLineHeight) {
        this.$refs.editorElement.focus()
        
        const selection = window.getSelection()
        if (selection.rangeCount === 0) {
          this.showStatus('请先选择要设置行间距的文本', 'warning')
          return
        }
        
        const range = selection.getRangeAt(0)
        
        this.cleanupExternalContent(range)
        
        if (range.collapsed) {
          const paragraph = this.getCurrentParagraph(range)
          if (paragraph) {
            const newRange = document.createRange()
            newRange.selectNodeContents(paragraph)
            selection.removeAllRanges()
            selection.addRange(newRange)
          } else {
            this.showStatus('请选择要设置行间距的文本', 'warning')
            return
          }
        }
        
        this.applyLineHeightToSelection(selection, this.selectedLineHeight)
        this.handleContentChange()
        this.showStatus('行间距设置成功', 'success')
      }
    },
    
    cleanupExternalContent(range) {
      const container = range.commonAncestorContainer
      
      if (container.nodeType === Node.TEXT_NODE || 
          (container.nodeType === Node.ELEMENT_NODE && container.tagName === 'DIV' && !container.innerHTML.includes('<'))) {
        this.formatPlainTextContent(range)
      }
    },
    
    formatPlainTextContent(range) {
      const selectedContent = range.extractContents()
      const lines = selectedContent.textContent.split('\n')
      
      const fragment = document.createDocumentFragment()
      
      lines.forEach((line, index) => {
        if (line.trim()) {
          const p = document.createElement('p')
          p.textContent = line.trim()
          p.style.lineHeight = '1.6'
          fragment.appendChild(p)
          
          if (index < lines.length - 1) {
            fragment.appendChild(document.createElement('br'))
          }
        }
      })
      
      range.insertNode(fragment)
    },
    
    getCurrentParagraph(range) {
      let node = range.startContainer
      while (node && node !== this.$refs.editorElement) {
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node.tagName === 'P' || node.tagName === 'DIV' || node.tagName === 'H1' || node.tagName === 'H2' || 
             node.tagName === 'H3' || node.tagName === 'H4' || node.tagName === 'H5' || node.tagName === 'H6')) {
          return node
        }
        node = node.parentNode
      }
      return null
    },
    
    applyLineHeightToSelection(selection, lineHeight) {
      const range = selection.getRangeAt(0)
      
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: function(node) {
            if (node.tagName === 'P' || node.tagName === 'DIV' || 
                node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' ||
                node.tagName === 'H4' || node.tagName === 'H5' || node.tagName === 'H6') {
              return NodeFilter.FILTER_ACCEPT
            }
            return NodeFilter.FILTER_SKIP
          }
        },
        false
      )
      
      let currentNode
      const nodesToStyle = []
      while (currentNode = walker.nextNode()) {
        if (range.intersectsNode(currentNode)) {
          nodesToStyle.push(currentNode)
        }
      }
      
      if (nodesToStyle.length === 0) {
        const selectedContent = range.extractContents()
        const span = document.createElement('span')
        span.style.lineHeight = lineHeight
        span.appendChild(selectedContent)
        range.insertNode(span)
      } else {
        nodesToStyle.forEach(node => {
          node.style.lineHeight = lineHeight
        })
      }
      
      selection.removeAllRanges()
      selection.addRange(range)
    },
    
    applyColor() {
      if (this.$refs.editorElement && this.selectedColor) {
        this.$refs.editorElement.focus()
        document.execCommand('styleWithCSS', false, true)
        document.execCommand('foreColor', false, this.selectedColor)
        this.handleContentChange()
      }
    },
    
    applyHeading() {
      if (this.$refs.editorElement && this.selectedHeading !== undefined) {
        this.$refs.editorElement.focus()
        
        const selection = window.getSelection()
        if (selection.rangeCount === 0) {
          this.showStatus('请先选择要设置格式的文本', 'warning')
          return
        }
        
        const range = selection.getRangeAt(0)
        
        if (range.collapsed) {
          const paragraph = this.getCurrentParagraph(range)
          if (paragraph) {
            const newRange = document.createRange()
            newRange.selectNodeContents(paragraph)
            selection.removeAllRanges()
            selection.addRange(newRange)
          } else {
            this.showStatus('请选择要设置格式的文本', 'warning')
            return
          }
        }
        
        const blockElement = this.getBlockElement(range)
        
        if (this.selectedHeading === '') {
          this.convertToParagraph(blockElement, range, selection)
          this.showStatus('已恢复为正文格式', 'success')
        } else {
          this.convertToHeading(blockElement, range, selection, this.selectedHeading)
          this.showStatus(`已设置为${this.selectedHeading.toUpperCase()}标题`, 'success')
        }
        
        this.handleContentChange()
      }
    },
    
    getBlockElement(range) {
      let node = range.startContainer
      while (node && node !== this.$refs.editorElement) {
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node.tagName === 'P' || node.tagName === 'DIV' || 
             node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' ||
             node.tagName === 'H4' || node.tagName === 'H5' || node.tagName === 'H6' ||
             node.tagName === 'BLOCKQUOTE')) {
          return node
        }
        node = node.parentNode
      }
      return null
    },
    
    convertToParagraph(blockElement, range, selection) {
      if (!blockElement) {
        document.execCommand('formatBlock', false, '<p>')
        return
      }
      
      if (blockElement.tagName.match(/^H[1-6]$/)) {
        const p = document.createElement('p')
        
        while (blockElement.firstChild) {
          p.appendChild(blockElement.firstChild)
        }
        
        p.style.fontSize = '16px'
        p.style.fontWeight = 'normal'
        p.style.margin = '1em 0'
        p.style.lineHeight = '1.6'
        
        blockElement.parentNode.replaceChild(p, blockElement)
        
        const newRange = document.createRange()
        newRange.selectNodeContents(p)
        selection.removeAllRanges()
        selection.addRange(newRange)
      } else {
        document.execCommand('formatBlock', false, '<p>')
      }
    },
    
    convertToHeading(blockElement, range, selection, headingLevel) {
      if (!blockElement) {
        document.execCommand('formatBlock', false, `<${headingLevel}>`)
        return
      }
      
      if (blockElement.tagName === 'P' || blockElement.tagName === 'DIV' || blockElement.tagName.match(/^H[1-6]$/)) {
        const heading = document.createElement(headingLevel)
        
        while (blockElement.firstChild) {
          heading.appendChild(blockElement.firstChild)
        }
        
        heading.style.margin = '1em 0'
        heading.style.lineHeight = '1.3'
        heading.style.fontWeight = 'bold'
        
        const fontSizeMap = {
          'h1': '2em',
          'h2': '1.5em',
          'h3': '1.25em',
          'h4': '1.1em',
          'h5': '1em',
          'h6': '0.9em'
        }
        heading.style.fontSize = fontSizeMap[headingLevel] || '1em'
        
        blockElement.parentNode.replaceChild(heading, blockElement)
        
        const newRange = document.createRange()
        newRange.selectNodeContents(heading)
        selection.removeAllRanges()
        selection.addRange(newRange)
      } else {
        document.execCommand('formatBlock', false, `<${headingLevel}>`)
      }
    },
    
    insertElement(elementType) {
      if (!this.$refs.editorElement) return
      
      this.$refs.editorElement.focus()
      const templates = {
        blockquote: '<blockquote style="color: #000000;">引用内容</blockquote>',
        code: '<pre style="color: #000000; background: #f5f5f5; padding: 10px; border-radius: 4px;"><code>// 代码示例</code></pre>',
        link: '<a href="https://example.com" target="_blank" style="color: #0066cc;">链接文本</a>'
      }
      
      if (templates[elementType]) {
        document.execCommand('insertHTML', false, templates[elementType])
        this.handleContentChange()
      }
    },
    
    clearFormat() {
      if (this.$refs.editorElement) {
        this.$refs.editorElement.focus()
        document.execCommand('removeFormat', false, null)
        document.execCommand('unlink', false, null)
        this.handleContentChange()
      }
    },
    
    triggerCoverInput() {
      this.$refs.coverInput?.click()
    },

    handleCoverUpload(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.showStatus('请选择图片文件', 'error')
          return
        }
        
        if (file.size > 5 * 1024 * 1024) {
          this.showStatus('图片大小不能超过5MB', 'error')
          return
        }
        
        this.coverFile = file
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.formData.cover_image = e.target.result
          this.showStatus('封面图片上传成功', 'success')
        }
        reader.onerror = () => {
          this.showStatus('封面图片上传失败', 'error')
        }
        reader.readAsDataURL(file)
        
        if (this.$refs.coverInput) {
          this.$refs.coverInput.value = ''
        }
      }
    },

    removeCover() {
      this.formData.cover_image = ''
      this.coverFile = null
      this.showStatus('封面图片已删除', 'success')
    },
    
    triggerFileInput() {
      this.$refs.fileInput?.click()
    },
    
    // 修改：直接处理文件上传并插入到文章中
    handleFileUpload(event) {
      const files = event.target.files
      if (files.length > 0) {
        this.processAndInsertFiles(Array.from(files))
      }
    },
    
    // 新增：直接处理并插入图片
    async processAndInsertFiles(files) {
      console.log('📁 处理文件:', files)
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          this.showStatus('请选择图片文件', 'error')
          continue
        }
        
        if (file.size > 5 * 1024 * 1024) {
          this.showStatus('图片大小不能超过5MB', 'error')
          continue
        }
        
        try {
          this.showStatus(`处理图片: ${file.name}`, 'info')
          console.log(`🔄 处理图片: ${file.name}, 大小: ${(file.size / 1024).toFixed(2)}KB`)
          
          // 将文件转换为base64
          const base64Data = await this.fileToBase64(file)
          console.log('📊 原始base64大小:', base64Data.length)
          
          // 优化图片（压缩和缩放）
          this.showStatus(`优化图片: ${file.name}`, 'info')
          const optimizedBase64 = await this.optimizeBase64Image(base64Data)
          
          // 插入优化后的base64图片到编辑器
          await this.insertImageToEditor(optimizedBase64, file.name, 'base64')
          this.showStatus(`图片 "${file.name}" 已插入`, 'success')
          
        } catch (error) {
          console.error(`❌ 图片 "${file.name}" 处理失败:`, error)
          this.showStatus(`图片 "${file.name}" 处理失败`, 'error')
        }
      }
      
      // 清理文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    // 将文件转换为base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          console.log('📊 base64数据长度:', e.target.result.length)
          resolve(e.target.result)
        }
        reader.onerror = (error) => {
          console.error('❌ 文件读取失败:', error)
          reject(error)
        }
        reader.readAsDataURL(file)
      })
    },
    
    // 优化base64图片
    optimizeBase64Image(base64Data, maxWidth = 800, quality = 0.8) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 计算缩放后的尺寸
          let width = img.width
          let height = img.height
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          
          // 绘制缩放后的图片
          ctx.drawImage(img, 0, 0, width, height)
          
          // 转换为优化后的base64
          const optimizedBase64 = canvas.toDataURL('image/jpeg', quality)
          console.log('📊 优化前后大小:', {
            original: base64Data.length,
            optimized: optimizedBase64.length,
            reduction: `${((1 - optimizedBase64.length / base64Data.length) * 100).toFixed(1)}%`
          })
          
          resolve(optimizedBase64)
        }
        
        img.onerror = () => {
          console.warn('图片优化失败，使用原始base64')
          resolve(base64Data) // 优化失败时返回原始数据
        }
        
        img.src = base64Data
      })
    },
    
    insertImageFromUrl() {
      if (this.imageUrl && this.isImageUrl(this.imageUrl)) {
        // 网络图片直接使用URL，不转换为base64
        this.insertImageToEditor(this.imageUrl, '网络图片', 'url')
        this.imageUrl = ''
        this.showImageModal = false
        this.showStatus('网络图片已插入', 'success')
      } else {
        this.showStatus('请输入有效的图片URL', 'error')
      }
    },
    
    // 修复：确保图片插入到当前光标位置
    async insertImageToEditor(imageUrl, fileName = '图片', type = 'base64') {
      if (!this.$refs.editorElement) return
      
      console.log(`🖼️ 插入图片 - 类型: ${type}, 文件名: ${fileName}`)
      
      // 确保编辑器获得焦点
      this.$refs.editorElement.focus()
      
      // 恢复之前保存的光标位置
      const restoreSuccess = this.restoreSelection()
      console.log('🔍 恢复光标位置:', restoreSuccess ? '成功' : '失败')
      
      const selection = window.getSelection()
      
      // 如果没有有效的选择范围，提示用户
      if (selection.rangeCount === 0) {
        this.showStatus('请在编辑器中点击选择插入位置', 'warning')
        return
      }
      
      const range = selection.getRangeAt(0)
      
      // 确保范围在编辑器内
      if (!this.$refs.editorElement.contains(range.commonAncestorContainer)) {
        this.showStatus('请在编辑器中点击选择插入位置', 'warning')
        return
      }
      
      // 生成唯一ID用于图片操作
      const imageId = 'img-' + Date.now()
      
      // 根据图片类型生成不同的HTML
      let imageHTML = ''
      if (type === 'base64') {
        // base64图片
        imageHTML = `
          <div class="base64-image-container" data-image-id="${imageId}" style="text-align: center; margin: 20px 0;">
            <img 
              id="${imageId}"
              src="${imageUrl}" 
              alt="${fileName}" 
              style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e9ecef; cursor: pointer;"
              class="editable-image base64-image"
              data-image-type="base64"
            />
            <div class="image-caption" contenteditable="true" style="text-align: center; color: #666; font-size: 14px; margin-top: 8px;">
              ${fileName}
            </div>
          </div>
        `
      } else {
        // 网络图片URL
        imageHTML = `
          <div class="url-image-container" data-image-id="${imageId}" style="text-align: center; margin: 20px 0;">
            <img 
              id="${imageId}"
              src="${imageUrl}" 
              alt="${fileName}" 
              style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e9ecef; cursor: pointer;"
              class="editable-image url-image"
              data-image-type="url"
            />
            <div class="image-caption" contenteditable="true" style="text-align: center; color: #666; font-size: 14px; margin-top: 8px;">
              ${fileName}
            </div>
          </div>
        `
      }
      
      console.log('📝 插入图片HTML到当前光标位置')
      
      try {
        // 在当前光标位置插入图片
        const div = document.createElement('div')
        div.innerHTML = imageHTML
        
        // 如果光标在文本节点中，需要特殊处理
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          const parent = range.startContainer.parentNode
          const offset = range.startOffset
          
          // 在文本节点中插入图片
          const beforeText = range.startContainer.textContent.substring(0, offset)
          const afterText = range.startContainer.textContent.substring(offset)
          
          // 创建新的DOM结构
          const fragment = document.createDocumentFragment()
          
          if (beforeText) {
            const beforeNode = document.createTextNode(beforeText)
            fragment.appendChild(beforeNode)
          }
          
          while (div.firstChild) {
            fragment.appendChild(div.firstChild)
          }
          
          if (afterText) {
            const afterNode = document.createTextNode(afterText)
            fragment.appendChild(afterNode)
          }
          
          // 替换原有文本节点
          parent.replaceChild(fragment, range.startContainer)
          
          // 将光标移动到图片后面
          const newRange = document.createRange()
          if (afterText) {
            newRange.setStart(afterNode, 0)
            newRange.setEnd(afterNode, 0)
          } else {
            // 如果没有后续文本，将光标放在图片容器后面
            const lastElement = fragment.lastElementChild || fragment.lastChild
            newRange.setStartAfter(lastElement)
            newRange.setEndAfter(lastElement)
          }
          selection.removeAllRanges()
          selection.addRange(newRange)
        } else {
          // 常规插入
          const fragment = document.createDocumentFragment()
          while (div.firstChild) {
            fragment.appendChild(div.firstChild)
          }
          range.insertNode(fragment)
          
          // 将光标移动到图片后面
          range.setStartAfter(fragment.lastChild)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        
        console.log('✅ 图片插入成功')
        
        // 添加图片点击事件监听
        this.$nextTick(() => {
          const imgElement = document.getElementById(imageId)
          if (imgElement) {
            imgElement.addEventListener('click', this.handleImageClick)
            console.log('✅ 图片点击事件绑定成功')
            
            // 滚动到图片位置
            imgElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
        
        // 立即更新内容
        this.handleContentChange()
        
      } catch (error) {
        console.error('❌ 图片插入失败:', error)
        this.showStatus('图片插入失败', 'error')
      }
    },
    
    isImageUrl(url) {
      return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url) || 
             url.startsWith('data:image/')
    },
    
    handleEditorClick(event) {
      if (event.target.tagName === 'IMG' && event.target.classList.contains('editable-image')) {
        this.selectImage(event.target)
        event.stopPropagation()
      } else if (!event.target.closest('.image-toolbar')) {
        this.deselectImage()
      }
    },
    
    handleGlobalClick(event) {
      if (!this.$refs.editorElement.contains(event.target) && 
          !event.target.closest('.image-toolbar')) {
        this.deselectImage()
      }
    },
    
    selectImage(imgElement) {
      this.deselectImage()
      
      this.selectedImage = imgElement
      this.selectedImageContainer = imgElement.closest('.editable-image-container')
      this.showImageToolbar = true
      imgElement.style.outline = '2px solid #4285f4'
      imgElement.style.outlineOffset = '2px'
      
      this.positionImageToolbar(imgElement)
    },
    
    deselectImage() {
      if (this.selectedImage) {
        this.selectedImage.style.outline = 'none'
        this.selectedImage = null
        this.selectedImageContainer = null
        this.showImageToolbar = false
      }
    },
    
    positionImageToolbar(imgElement) {
      const rect = imgElement.getBoundingClientRect()
      const containerRect = this.$el.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      const bottom = containerRect.bottom - rect.bottom - 6
      const left = rect.left + (rect.width / 2)
      
      this.imageToolbarStyle = {
        bottom: `${Math.max(10, bottom)}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)'
      }
    },
    
    resizeImage(scale) {
      if (!this.selectedImage) return
      
      const currentWidth = parseInt(this.selectedImage.style.width) || this.selectedImage.offsetWidth
      const newWidth = currentWidth * scale
      
      if (newWidth < 50) return
      if (newWidth > 1000) return
      
      this.selectedImage.style.width = `${newWidth}px`
      this.selectedImage.style.height = 'auto'
      
      this.positionImageToolbar(this.selectedImage)
      
      this.handleContentChange()
      
      this.$nextTick(() => {
        if (this.selectedImage && this.$refs.editorElement) {
          this.$refs.editorElement.focus()
          
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNode(this.selectedImage)
          selection.removeAllRanges()
          selection.addRange(range)
          
          this.showImageToolbar = true
          this.selectedImage.style.outline = '2px solid #4285f4'
          this.selectedImage.style.outlineOffset = '2px'
        }
      })
    },
    
    alignImage(alignment) {
      if (!this.selectedImageContainer) return
      
      this.selectedImageContainer.style.textAlign = alignment
      
      this.handleContentChange()
      this.showStatus(`图片已${this.getAlignmentText(alignment)}`, 'success')
      
      this.$nextTick(() => {
        if (this.selectedImage && this.$refs.editorElement) {
          this.$refs.editorElement.focus()
          
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNode(this.selectedImage)
          selection.removeAllRanges()
          selection.addRange(range)
          
          this.showImageToolbar = true
          this.selectedImage.style.outline = '2px solid #4285f4'
          this.selectedImage.style.outlineOffset = '2px'
        }
      })
    },
    
    getAlignmentText(alignment) {
      const alignmentMap = {
        'left': '左对齐',
        'center': '居中对齐',
        'right': '右对齐'
      }
      return alignmentMap[alignment] || '对齐'
    },
    
    deleteSelectedImage() {
      if (!this.selectedImage) return
      
      const container = this.selectedImage.closest('.editable-image-container')
      if (container) {
        container.remove()
      } else {
        this.selectedImage.remove()
      }
      
      this.deselectImage()
      this.handleContentChange()
      this.showStatus('图片已删除', 'success')
    },
    
    addTag() {
      const tag = this.newTag.trim()
      if (tag && !this.formData.tags.includes(tag)) {
        this.formData.tags.push(tag)
        this.newTag = ''
      }
    },
    
    removeTag(index) {
      this.formData.tags.splice(index, 1)
    },
    
    handleBack() {
      if (this.formData.title || this.formData.content) {
        if (confirm('您有未保存的内容，确定要离开吗？')) {
          this.$router.back()
        }
      } else {
        this.$router.back()
      }
    },

    async handleSaveDraft() {
      try {
        const formData = new FormData()
        
        formData.append('title', this.formData.title || '')
        formData.append('summary', this.formData.summary || '')
        formData.append('content', this.formData.content || '')
        formData.append('category', this.formData.category || 'technology')
        formData.append('visibility', this.formData.visibility || 'public')
        formData.append('status', 'draft')
        
        // 修复：将标签数组转换为 JSON 字符串
        if (this.formData.tags.length > 0) {
          formData.append('tags', JSON.stringify(this.formData.tags))
        } else {
          formData.append('tags', JSON.stringify([]))
        }
        
        if (this.coverFile) {
          formData.append('cover_image', this.coverFile)
        }
        
        if (this.$route.query.labelId) {
          formData.append('labelId', this.$route.query.labelId)
        }

        console.log('发送草稿数据（FormData）')
        console.log('标题:', this.formData.title)
        console.log('分类:', this.formData.category)
        console.log('标签:', this.formData.tags)
        console.log('标签JSON:', JSON.stringify(this.formData.tags))
        console.log('可见性:', this.formData.visibility)
        console.log('状态:', 'draft')

            
        const headers = {
          'Content-Type': 'multipart/form-data'
        }
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')

        if (token) {
          headers['Authorization'] = `Token ${token}`
        } else {
          console.warn('未找到用户 Token，请检查登录状态')
          this.showStatus('用户未登录，请重新登录', 'error')
          return
        }

        const response = await axios.post(
          this.$constant.baseURL + "/blogs/create/", 
          formData,
          {
            headers
          }
        )

        console.log('服务器响应:', response.data)
        if (response.data.success) {
          this.showStatus(response.data.message || '草稿保存成功', 'success')
          if (response.data.data && response.data.data.id) {
            this.$router.replace({
              query: { ...this.$route.query, id: response.data.data.id }
            })
          }
        } else {
          this.showStatus(response.data.message || '保存草稿失败', 'error')
        }
      } catch (error) {
        console.error('保存草稿到服务器失败:', error)
        if (error.response && error.response.data) {
          console.log('错误详情:', error.response.data)
          this.showStatus(error.response.data.message || '服务器保存失败', 'warning')
        } else {
          this.showStatus('网络错误，请重试', 'warning')
        }
      }
    },

    async handlePublish() {
      // 添加内容长度验证
      const contentText = this.formData.content.replace(/<[^>]*>/g, '').trim();
      if (contentText.length < 10) {
        this.showStatus('博客内容至少需要10个字符', 'warning');
        return;
      }

      if (!this.isFormValid) {
        this.showStatus('请填写标题和内容', 'warning')
        return
      }

      this.showStatus('发布中...', 'info')
      
      try {
        const formData = new FormData()
        
        formData.append('title', this.formData.title || '')
        formData.append('summary', this.formData.summary || '')
        formData.append('content', this.formData.content || '')
        formData.append('category', this.formData.category || 'technology')
        formData.append('visibility', this.formData.visibility || 'public')
        formData.append('status', 'published')
        
        // 修复：将标签数组转换为 JSON 字符串
        if (this.formData.tags.length > 0) {
          formData.append('tags', JSON.stringify(this.formData.tags))
        } else {
          formData.append('tags', JSON.stringify([]))
        }
        
        if (this.coverFile) {
          formData.append('cover_image', this.coverFile)
        }
        
        if (this.$route.query.labelId) {
          formData.append('labelId', this.$route.query.labelId)
        }

        console.log('发送发布数据（FormData）')
        console.log('标题:', this.formData.title)
        console.log('分类:', this.formData.category)
        console.log('标签:', this.formData.tags)
        console.log('标签JSON:', JSON.stringify(this.formData.tags))
        console.log('可见性:', this.formData.visibility)
        console.log('状态:', 'published')

        const url = this.isEditing 
          ? this.$constant.baseURL + `/blogs/update/${this.$route.query.id}/`
          : this.$constant.baseURL + "/blogs/create/"

        const method = this.isEditing ? 'put' : 'post'

        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        const headers = {
          'Content-Type': 'multipart/form-data'
        }
        
        if (token) {
          headers['Authorization'] = `Token ${token}`
        } else {
          console.warn('未找到用户 Token，请检查登录状态')
          this.showStatus('用户未登录，请重新登录', 'error')
          return
        }
        
        const response = await axios[method](url, formData, { headers })
        
        console.log('发布响应:', response.data)
        if (response.data.success) {
          this.showStatus(response.data.message || '博客发布成功', 'success')
          
          localStorage.removeItem('blog-draft')
          
          setTimeout(() => {
            this.showSuccessPanel(response.data.data)
          }, 1500)
        } else {
          this.showStatus(response.data.message || '发布失败', 'error')
        }
      } catch (error) {
        console.error('发布失败:', error)
        if (error.response && error.response.data) {
          console.log('错误详情:', error.response.data)
          
          if (error.response.data.errors) {
            const errors = error.response.data.errors
            let errorMessage = '数据验证失败: '
            for (const field in errors) {
              errorMessage += `${field}: ${errors[field].join(', ')}; `
            }
            this.showStatus(errorMessage, 'error')
          } else if (error.response.data.error_code === 'DUPLICATE_PUBLISHED_TITLE') {
            this.showStatus('您已经发布过同名的博客，请修改标题', 'error')
          } else {
            this.showStatus(error.response.data.message || '发布失败，请重试', 'error')
          }
        } else {
          this.showStatus('网络错误，请检查连接后重试', 'error')
        }
      }
    },

    showSuccessPanel(blogData) {
      this.showStatus('', '')
      
      this.publishSuccess = true
      this.publishedBlog = blogData
      
      setTimeout(() => {
        this.publishSuccess = false
      }, 5000)
    },

    handleViewBlog() {
      if (this.publishedBlog && this.publishedBlog.id) {
        window.open(this.$constant.baseURL + `/blog/${this.publishedBlog.id}/`, '_blank')
      }
    },

    handleCreateNew() {
      this.resetForm()
      this.publishSuccess = false
    },

    handleContinueEditing() {
      this.publishSuccess = false
    },
    
    showStatus(message, type = 'info') {
      this.status.message = message
      this.status.type = type
      
      if (type !== 'info') {
        setTimeout(() => {
          this.status.message = ''
          this.status.type = ''
        }, 3000)
      }
    }
  }
}
</script>



<style scoped>
/* 基础样式 */
.blog-editor-container {
  min-height: 80vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-top: 40px;
  position: relative;
}

/* 头部样式 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8f9fa;
}

.editor-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 主内容区域 */
.editor-main {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.editor-panel {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 表单样式 */
.form-section {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #4285f4;
}

.title-input {
  font-size: 16px;
  font-weight: 500;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

/* 封面图片样式 */
.cover-upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-upload-area:hover {
  border-color: #4285f4;
  background: #e3f2fd;
}

.cover-placeholder {
  color: #6c757d;
}

.cover-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.cover-hint {
  font-size: 12px;
  color: #adb5bd;
  margin-top: 6px;
}

.cover-preview {
  width: 100%;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  object-fit: cover;
}

.cover-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.cover-btn {
  padding: 6px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.cover-btn:hover {
  background: #f8f9fa;
  border-color: #4285f4;
}

.cover-btn.delete {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.cover-btn.delete:hover {
  background: #c82333;
}

/* 标签样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
}

.tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.tag-remove {
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  line-height: 1;
}

.tag-input {
  border: none;
  outline: none;
  padding: 6px 0;
  font-size: 14px;
  background: transparent;
  min-width: 100px;
}

/* 工具栏样式 */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-label {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
}

.tool-select {
  padding: 6px 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  min-width: 70px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-input {
  width: 28px;
  height: 28px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
}

.color-preview {
  width: 16px;
  height: 16px;
  border: 1px solid #e9ecef;
  border-radius: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e9ecef;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.tool-btn:hover {
  background: #f8f9fa;
  border-color: #4285f4;
}

/* 对齐按钮组 */
.alignment-buttons {
  display: flex;
  gap: 2px;
}

.alignment-buttons .tool-btn {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

/* 编辑器内容区域 */
.editor-content {
  min-height: 400px;
  border: 1px solid #e9ecef;
  border-radius: 0 0 6px 6px;
  padding: 16px;
  font-size: 15px;
  line-height: 1.6;
  background: white;
  outline: none;
  color: #000000;
  position: relative;
}

/* 设置卡片样式 */
.settings-card, .preview-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.settings-title, .preview-title {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #495057;
  font-size: 13px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
}

.radio-input {
  margin: 0;
}

.radio-text {
  font-size: 13px;
  color: #999999;
}

/* 预览区域 */
.preview-content {
  max-height: 500px;
  overflow-y: auto;
}

.blog-preview {
  padding: 0;
}

.preview-cover {
  margin-bottom: 20px;
}

.cover-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.preview-title {
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: #212529;
}

.preview-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6c757d;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.preview-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.preview-body {
  line-height: 1.7;
  color: #000;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4285f4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3367d6;
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #495057;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #4285f4;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #212529;
  font-size: 1.2rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #212529;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 标签页样式 */
.tab-buttons {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 13px;
  color: #6c757d;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #4285f4;
  border-bottom-color: #4285f4;
}

.tab-btn:hover {
  color: #4285f4;
}

.tab-content {
  min-height: 200px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 6px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.upload-area:hover {
  border-color: #4285f4;
  background: #e3f2fd;
}

.file-input {
  display: none;
}

.upload-placeholder {
  color: #6c757d;
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.upload-hint {
  font-size: 11px;
  color: #adb5bd;
  margin-top: 6px;
}

/* URL输入 */
.url-input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #495057;
  font-size: 13px;
}

.url-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 13px;
}

.url-preview {
  margin-top: 12px;
  text-align: center;
}

.url-preview-img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.preview-text {
  margin-top: 6px;
  color: #6c757d;
  font-size: 12px;
}

.url-error {
  margin-top: 6px;
  color: #dc3545;
  font-size: 12px;
}

/* 图片工具栏样式 - 下方显示 */
.image-toolbar {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border: 1px solid #e9ecef;
  z-index: 1000;
  min-width: 500px;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.image-tool-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-tool-label {
  font-size: 13px;
  color: #495057;
  font-weight: 600;
  white-space: nowrap;
}

.image-tool-group {
  display: flex;
  gap: 8px;
}

.image-tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: #495057;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 70px;
}

.image-tool-btn:hover {
  background: #f8f9fa;
  border-color: #4285f4;
  transform: translateY(-1px);
}

.image-tool-btn.delete {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
  margin-left: auto;
}

.image-tool-btn.delete:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.tool-icon {
  font-size: 14px;
  font-weight: bold;
}

.tool-text {
  font-size: 12px;
}

/* 状态提示 */
.status-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 18px;
  border-radius: 6px;
  font-weight: 500;
  z-index: 1000;
  font-size: 13px;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-main {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .sidebar-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .editor-main {
    padding: 16px;
  }
  
  .editor-panel {
    padding: 16px;
  }
  
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .toolbar-group {
    justify-content: space-between;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  /* 图片工具栏样式 - 图片底部显示 */
  .image-toolbar {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border: 1px solid #e9ecef;
    z-index: 1000;
    min-width: auto;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
  }

  .image-tool-section {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .image-tool-label {
    font-size: 11px;
    color: #495057;
    font-weight: 600;
    white-space: nowrap;
    display: none; /* 隐藏标签文字 */
  }

  .image-tool-group {
    display: flex;
    gap: 4px;
  }

  .image-tool-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    background: white;
    color: #495057;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s;
    min-width: auto;
    height: 24px;
  }

  .image-tool-btn:hover {
    background: #f8f9fa;
    border-color: #4285f4;
    transform: translateY(-1px);
  }

  .image-tool-btn.delete {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
    margin-left: 4px;
  }

  .image-tool-btn.delete:hover {
    background: #c82333;
    transform: translateY(-1px);
  }

  .tool-icon {
    font-size: 12px;
    font-weight: bold;
  }

  .tool-text {
    font-size: 10px;
    display: none; /* 隐藏按钮文字 */
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .image-toolbar {
      padding: 6px 10px;
      gap: 6px;
      bottom: -45px;
    }
    
    .image-tool-btn {
      padding: 3px 6px;
      height: 22px;
      font-size: 10px;
    }
    
    .tool-icon {
      font-size: 11px;
    }
  }
}
</style>