<template>
  <div class="blog-container" :class="{ 'detail-view': selectedBlog }">
    <!-- 博客列表頁 -->
    <div v-if="!selectedBlog" class="blog-list-view">
      <!-- 加載狀態 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加載中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error">


        <h3>加載失敗,请登陆后重试！</h3>

        <!--
        <h3>加載失敗</h3>
        <p>{{ error }}</p>
        <button @click="fetchBlogs" class="retry-btn">重試</button>        
        -->


      </div>

      <!-- 主要內容 -->
      <div v-else class="blog-content">
        <!-- 控制區域 -->
        <div class="blog-controls">
          <div class="search-section">
            <div class="search-input-wrapper">
              <input 
                v-model="searchQuery" 
                placeholder="搜索博客標題、內容..." 
                class="search-input"
                @keyup.enter="handleSearch"
                @input="clearSearchStatus"
              />
              <button @click="handleSearch" class="search-btn" :disabled="searchLoading">
                <span v-if="searchLoading" class="search-loading"></span>
                <span v-else class="search-icon">🔍</span>
                {{ searchLoading ? '搜索中...' : '搜索' }}
              </button>
              <button 
                @click="clearSearch" 
                class="clear-btn" 
                v-if="searchQuery || categoryFilter"
                :disabled="searchLoading"
              >
                ✕ 清除
              </button>
            </div>
            
            <!-- 搜索提示 -->
            <div v-if="hasSearchResults" class="search-tips">
              搜索: "{{ searchQuery }}"
              <span v-if="categoryFilter"> | 分類: {{ getCategoryLabel(categoryFilter) }}</span>
              <span class="search-result"> • 找到 {{ filteredBlogsCount }} 篇相關文章</span>
            </div>

            <div v-else-if="searchQuery && !loading" class="search-tips no-results">
              搜索: "{{ searchQuery }}"
              <span v-if="categoryFilter"> | 分類: {{ getCategoryLabel(categoryFilter) }}</span>
              <span class="search-result"> •...</span>
            </div>
          </div>

          <div class="filter-section">
            <select v-model="categoryFilter" @change="handleCategoryChange" class="category-select">
              <option value="">所有分類</option>
              <option value="technology">技術</option>
              <option value="life">生活</option>
              <option value="design">設計</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div class="stats-section">
            <span class="blog-count">共 {{ totalCount }} 篇博客</span>
          </div>
        </div>

        <!-- 博客列表 -->
        <div class="blog-list">
          <div 
            v-for="blog in blogs" 
            :key="blog.id" 
            class="blog-card"
            @click="viewBlogDetail(blog.id)"
          >
            <!-- 封面圖片 -->
            <div class="blog-cover" v-if="getCoverImageUrl(blog.cover_image)">
              <img 
                :src="getCoverImageUrl(blog.cover_image)" 
                :alt="blog.title"
                class="cover-image"
                @error="handleImageError"
              />
            </div>
            
            <div class="blog-content-wrapper">
              <div class="blog-header">
                <h3 class="blog-title">{{ blog.title }}</h3>
                <span class="blog-category" :class="getCategoryClass(blog.category)">
                  {{ getCategoryLabel(blog.category) }}
                </span>
              </div>
              
              <p class="blog-summary" v-if="blog.summary">
                {{ blog.summary }}
              </p>
              <p class="blog-content-preview" v-else>
                {{ getContentPreview(blog.content) }}
              </p>

              <div class="blog-meta">
                <div class="blog-tags">
                  <span 
                    v-for="tag in (blog.tags || [])" 
                    :key="tag" 
                    class="blog-tag"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="!blog.tags || blog.tags.length === 0" class="no-tags">暫無標籤</span>
                </div>
                
                <div class="blog-info">

                  <span class="reading-time">
                    👤{{ blog.author_name }}
                  </span>

                  <span class="publish-time">
                    {{ formatDate(blog.published_at || blog.created_at) }}
                  </span>

                  <span class="visibility" :class="blog.visibility || 'public'">
                    {{ (blog.visibility || 'public') === 'public' ? '公開' : '私密' }}
                  </span>

                </div>
              </div>
            </div>
          </div>

          <!-- 空狀態 -->
          <div v-if="blogs.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3 v-if="searchQuery || categoryFilter">沒有找到相關内容</h3>
            <h3 v-else>暫無博客</h3>
            
            <p v-if="searchQuery">
              沒有找到包含 "<strong>{{ searchQuery }}</strong>" 的博客
              <span v-if="categoryFilter">，且分類為 "{{ getCategoryLabel(categoryFilter) }}"</span>
            </p>
            <p v-else-if="categoryFilter">
              沒有找到分類為 "{{ getCategoryLabel(categoryFilter) }}" 的博客
            </p>
            <p v-else>還沒有發布的博客內容</p>
            
            <button 
              v-if="searchQuery || categoryFilter" 
              @click="clearSearch" 
              class="retry-btn"
            >
              🔄 顯示所有博客
            </button>
          </div>
        </div>

        <!-- 分頁控件 -->
        <div class="pagination" v-if="pagination && pagination.total_pages > 1">
          <button 
            @click="changePage(currentPage - 1)"
            :disabled="!pagination.has_previous"
            class="pagination-btn"
          >
            上一頁
          </button>
          
          <span class="page-info">
            第 {{ pagination.current_page }} 頁，共 {{ pagination.total_pages }} 頁
          </span>
          
          <button 
            @click="changePage(currentPage + 1)"
            :disabled="!pagination.has_next"
            class="pagination-btn"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>

    <!-- 博客詳情全屏頁面 -->
    <div v-else class="blog-detail-fullscreen">
      <!-- 詳情頁頭部 -->
      <header class="detail-header">
        <div class="header-content">
          <button class="back-btn" @click="closeDetail">
            <span class="back-icon">←</span>
            返回列表
          </button>
          
        

        <div class="detail-actions">
          <button class="action-btn" @click="shareBlog" title="分享">
            <span class="action-icon">🔗</span>
            分享
          </button>
          <button class="action-btn" @click="toggleDarkMode" title="切換主題">
            <span class="action-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            {{ isDarkMode ? '淺色' : '深色' }}
          </button>
          <button class="action-btn" @click="printBlog" title="打印">
            <span class="action-icon">🖨️</span>
            打印
          </button>
          
          <!-- 新增的编辑删除按钮 -->
          <div v-if="isPersonalMode" class="personal-actions">
            <button class="action-btn" @click="editBlog" title="編輯">
              <span class="action-icon">✏️</span>
              編輯
            </button>
            <button class="action-btn" @click="deleteBlog" title="刪除">
              <span class="action-icon">🗑️</span>
              刪除
            </button>
          </div>
        </div>

        </div>
      </header>

      <!-- 博客詳情內容 -->
      <main class="detail-main">
        <article class="blog-article">
          <!-- 文章頭部 -->
          <header class="article-header">
            <!-- 封面圖片 -->
            <div class="article-cover" v-if="getCoverImageUrl(selectedBlog.cover_image)">
              <img 
                :src="getCoverImageUrl(selectedBlog.cover_image)" 
                :alt="selectedBlog.title"
                class="cover-image-full"
                @error="handleImageError"
              />
            </div>

            <div class="article-meta-top">
              <span class="category-badge" :class="getCategoryClass(selectedBlog.category)">
                {{ getCategoryLabel(selectedBlog.category) }}
              </span>
              <span class="reading-time-full">
                ⏱️ {{ selectedBlog.reading_time || 1 }}分鐘閱讀
              </span>
            </div>
            
            <h1 class="article-title">{{ selectedBlog.title }}</h1>

            <div class="article-meta">
              <div class="author-info">
                <div class="author-avatar">
                  <img 
                    v-if="selectedBlog.author_avatar" 
                    :src="selectedBlog.author_avatar" 
                    :alt="selectedBlog.author_name"
                    class="avatar-image"
                  />
                  <span v-else class="avatar-placeholder">👤</span>
                </div>
                <div class="author-details">
                  <span class="author-name">{{ selectedBlog.author_name || '匿名作者' }}</span>
                  <span v-if="selectedBlog.author_full_name && selectedBlog.author_full_name !== selectedBlog.author_name" 
                        class="author-full-name">
                    ({{ selectedBlog.author_full_name }})
                  </span>
                </div>
              </div>
              <div class="publish-info">
                <span class="publish-date">
                  {{ formatDetailDate(selectedBlog.published_at || selectedBlog.created_at) }}
                </span>
                <span class="visibility-badge" :class="selectedBlog.visibility || 'public'">
                  {{ (selectedBlog.visibility || 'public') === 'public' ? '公開' : '私密' }}
                </span>
              </div>
            </div>

            <!-- 標籤 -->
            <div class="article-tags" v-if="selectedBlog.tags && selectedBlog.tags.length > 0">
              <span 
                v-for="tag in selectedBlog.tags" 
                :key="tag" 
                class="tag-item"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- 摘要 -->
            <div class="article-summary" v-if="selectedBlog.summary">
              <div class="summary-label">內容摘要</div>
              <p>{{ selectedBlog.summary }}</p>
            </div>
          </header>

          <!-- 文章內容 -->
          <div class="article-content" v-html="selectedBlog.content"></div>

          <!-- 文章底部 -->
          <footer class="article-footer">
            <div class="article-actions">
              <button 
                class="article-action-btn" 
                :class="{ 'liked': selectedBlog.is_liked }"
                @click="likeBlog"
              >
                <span class="action-icon">{{ selectedBlog.is_liked ? '❤️' : '🤍' }}</span>
                點讚 ({{ selectedBlog.like_count || 0 }})
              </button>
              <button 
                class="article-action-btn" 
                @click="toggleComments"
              >
                <span class="action-icon">💬</span>
                評論 ({{ selectedBlog.comment_count || 0 }})
              </button>
              <button 
                class="article-action-btn" 
                :class="{ 'collected': selectedBlog.is_collected }"
                @click="bookmarkBlog"
              >
                <span class="action-icon">{{ selectedBlog.is_collected ? '⭐' : '☆' }}</span>
                收藏
              </button>
              <button class="article-action-btn" @click="shareBlog">
                <span class="action-icon">🔗</span>
                分享
              </button>
            </div>
            
            <div class="update-info">
              最後更新於 {{ formatDetailDate(selectedBlog.updated_at) }}
            </div>
          </footer>
        </article>

        <!-- 評論區 -->
        <section v-if="showComments" class="comments-section modern-comments">
          <div class="comments-header">
            <div class="comments-title-section">
              <h2 class="comments-title">
                <span class="comments-icon">💬</span>
                評論區
              </h2>
              <div class="comments-stats">
                <span class="comments-count">{{ totalCommentCount }} 條評論</span>
                <span class="comments-likes">{{ selectedBlog.like_count || 0 }} 個讚</span>
              </div>
            </div>
            <div class="comments-actions">
              <button class="sort-btn" @click="toggleSort">
                <span class="sort-icon">{{ sortNewest ? '🕐' : '🔥' }}</span>
                {{ sortNewest ? '最新' : '熱門' }}
              </button>
              <button class="refresh-btn" @click="refreshComments">
                <span class="refresh-icon">🔄</span>
                刷新
              </button>
            </div>
          </div>
          
          <!-- 評論發表卡片 -->
          <div class="comment-publish-card">
            <div class="publish-header">
              <div class="user-avatar">
                <img 
                  v-if="currentUserAvatar" 
                  :src="currentUserAvatar" 
                  :alt="currentUserName"
                  class="avatar-image"
                />
                <span v-else class="avatar-placeholder">👤</span>
              </div>
              <div class="publish-info">
                <h4>{{ currentUserName || '發表評論' }}</h4>
                <p>分享你的想法...</p>
              </div>
            </div>
            <div class="publish-body">
              <textarea
                v-model="newComment"
                class="comment-input modern-textarea"
                placeholder="寫下你的評論...（支持 Markdown 語法）"
                rows="4"
                maxlength="1000"
                @focus="onCommentFocus"
                @blur="onCommentBlur"
              ></textarea>
              <div v-if="showFormatHelp" class="format-help">
                <span class="format-tip">**粗體** *斜體* `代碼` [鏈接](url)</span>
              </div>
            </div>
            <div class="publish-footer">
              <div class="comment-tools">
                <button class="tool-btn" @click="insertFormat('**', '**')" title="粗體">
                  <strong>B</strong>
                </button>
                <button class="tool-btn" @click="insertFormat('*', '*')" title="斜體">
                  <em>I</em>
                </button>
                <button class="tool-btn" @click="insertFormat('`', '`')" title="代碼">
                  <code>{ }</code>
                </button>
                <button class="tool-btn" @click="insertFormat('[鏈接](', ')')" title="鏈接">
                  🔗
                </button>
              </div>
              <div class="publish-actions">
                <span class="comment-length" :class="{ 'length-warning': newComment.length > 800 }">
                  {{ newComment.length }}/1000
                </span>
                <button class="btn btn-outline" @click="cancelComment">
                  取消
                </button>
                <button 
                  class="btn btn-primary publish-btn" 
                  @click="submitComment" 
                  :disabled="!newComment.trim()"
                  :class="{ 'pulsing': newComment.trim().length > 0 }"
                >
                  <span class="btn-icon">🚀</span>
                  發表評論
                </button>
              </div>
            </div>
          </div>

          <!-- 評論列表 -->
          <div class="comments-list-container">
            <div v-if="commentsLoading" class="comments-loading">
              <div class="loading-wave">
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
              </div>
              <p>加載評論中...</p>
            </div>
            
            <div v-else-if="comments.length === 0" class="empty-comments">
              <div class="empty-illustration">
                <span class="empty-emoji">💬</span>
              </div>
              <h3>還沒有評論</h3>
              <p>成為第一個分享想法的人吧！</p>
              <button class="btn btn-primary" @click="focusCommentInput">
                <span class="btn-icon">✍️</span>
                立即評論
              </button>
            </div>
            
            <div v-else class="comments-list">
              <!-- 評論過濾器 -->
              <div class="comments-filter">
                <div class="filter-tabs">
                  <button 
                    class="filter-tab" 
                    :class="{ active: currentFilter === 'all' }"
                    @click="currentFilter = 'all'"
                  >
                    全部評論
                  </button>
                  <button 
                    class="filter-tab" 
                    :class="{ active: currentFilter === 'popular' }"
                    @click="currentFilter = 'popular'"
                  >
                    最熱評論
                  </button>
                </div>
                <div class="filter-stats">
                  已顯示 {{ displayedComments.length }} 條評論
                </div>
              </div>






              <!-- 評論項目 -->
              <div class="comment-items">
                <transition-group name="comment-fade">



                  <comment-item 
                    v-for="comment in displayedComments" 
                    :key="comment.id" 
                    :comment="comment"
                    :depth="0"
                    @reply="handleReply"
                    @like="handleLike"
                  />



                </transition-group>
              </div>
              
              <!-- 加載更多 -->
              <div v-if="hasMoreComments" class="load-more-section">
                <button class="load-more-btn" @click="loadMoreComments">
                  <span class="load-icon">📥</span>
                  加載更多評論
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- 狀態提示 -->
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



const CommentItem = {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    isChildComment: {  // 新增：標記是否為子評論
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showReply: false,
      replyContent: '',
      showReplies: this.depth === 0,
      isExpanded: true,
      imageError: false
    }
  },
  computed: {
    isDeepNested() {
      return this.depth >= 3
    },
    shouldCollapse() {
      return this.depth >= 2
    },
    replyCount() {
      return this.comment.reply_count || (this.comment.replies ? this.comment.replies.length : 0)
    },
    avatarUrl() {
      if (this.comment.user_avatar) {
        return this.comment.user_avatar;
      }
      return this.getDefaultAvatar(this.comment.user_name);
    },
    // 新增：判斷是否顯示父評論指示器
    shouldShowParentIndicator() {
      return this.isChildComment && this.depth > 0;
    }
  },
  methods: {
    getDefaultAvatar(username) {
      const name = username || '匿名用戶';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=64`;
    },
    handleAvatarError() {
      this.imageError = true;
    },
    toggleReplies() {
      this.showReplies = !this.showReplies;
    },
    showReplyForm() {
      this.showReply = true;
    },
    cancelReply() {
      this.showReply = false;
      this.replyContent = '';
    },
    submitReply() {
      this.$emit('reply', this.comment, this.replyContent);
      this.cancelReply();
    },
    likeComment() {
      this.$emit('like', this.comment);
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
    formatCommentTime(timeString) {
      if (!timeString) return '未知時間';
      try {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '剛剛';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return '未知時間';
      }
    }
  },

  render(h) {
    // 構建 class 對象 - 移除 marginLeft 樣式
    const commentClasses = {
      'modern-comment-item': true,
      'has-replies': this.replyCount > 0,
      'child-comment': this.isChildComment,  // 新增：子評論樣式
      'top-level': !this.isChildComment,     // 新增：頂級評論樣式
      'collapsed': !this.isExpanded && this.shouldCollapse
    };

    // 1. 父評論指示器（如果這是子評論）
    const parentIndicator = this.shouldShowParentIndicator
      ? h('div', { class: 'parent-indicator' }, [
          h('span', { class: 'indicator-icon' }, '↳'),
          h('span', { class: 'indicator-text' }, '回复 ' + (this.comment.parent_info?.user_name || '上一条评论'))
        ])
      : null;

    // 2. 頭像部分
    const avatarElement = !this.imageError && this.avatarUrl 
      ? h('img', {
          attrs: {
            src: this.avatarUrl,
            alt: this.comment.user_name || '匿名用戶'
          },
          class: 'avatar-image',
          on: {
            error: this.handleAvatarError
          }
        })
      : h('div', { class: 'avatar-fallback' }, 
          (this.comment.user_name || '匿名用戶').charAt(0).toUpperCase()
        );

    // 3. 用戶信息部分
    const userInfoElement = h('div', { class: 'user-info' }, [
      h('span', { class: 'user-name' }, this.comment.user_name || '匿名用戶'),
      this.comment.is_author 
        ? h('span', { class: 'user-badge' }, '作者')
        : null
    ]);

    // 4. 評論頭部
    const commentHeader = h('div', { class: 'comment-header' }, [
      h('div', { class: 'comment-user' }, [
        h('div', { class: 'user-avatar' }, [avatarElement]),
        h('div', { class: 'user-details' }, [
          userInfoElement,
          h('span', { class: 'comment-time' }, this.formatCommentTime(this.comment.created_at))
        ])
      ]),
      h('div', { class: 'comment-actions' }, [
        h('button', {
          class: {
            'comment-like-btn': true,
            'liked': this.comment.is_liked
          },
          on: {
            click: this.likeComment
          }
        }, [
          h('span', { class: 'like-icon' }, this.comment.is_liked ? '❤️' : '🤍'),
          h('span', { class: 'like-count' }, this.comment.like_count || 0)
        ]),
        h('button', {
          class: 'comment-menu-btn',
          on: {
            click: this.toggleExpand
          }
        }, [
          h('span', { class: 'menu-icon' }, '⋯')
        ])
      ])
    ]);

    // 5. 評論內容部分
    const contentClasses = {
      'comment-content': true,
      'collapsed-content': !this.isExpanded && this.shouldCollapse
    };

    const commentContent = h('div', { class: contentClasses }, [
      h('div', { class: 'content-text' }, this.comment.content || ''),
      !this.isExpanded && this.shouldCollapse
        ? h('div', {
            class: 'expand-overlay',
            on: {
              click: this.toggleExpand
            }
          }, [
            h('span', '展開完整內容')
          ])
        : null
    ]);

    // 6. 評論底部按鈕
    const commentFooter = h('div', { class: 'comment-footer' }, [
      h('button', {
        class: 'reply-btn',
        on: {
          click: this.showReplyForm
        }
      }, [
        h('span', { class: 'reply-icon' }, '↩️'),
        '回復'
      ]),
      
      this.replyCount > 0
        ? h('button', {
            class: {
              'toggle-replies-btn': true,
              'expanded': this.showReplies
            },
            on: {
              click: this.toggleReplies
            }
          }, [
            h('span', { class: 'toggle-icon' }, this.showReplies ? '▼' : '▶'),
            (this.showReplies ? '收起' : '查看') + '回復 (' + this.replyCount + ')'
          ])
        : null
    ]);

    // 7. 回復表單部分
    let replyForm = null;
    if (this.showReply) {
      replyForm = h('div', { class: 'reply-form' }, [
        h('div', { class: 'reply-header' }, [
          h('span', { class: 'reply-to' }, '回復 @' + (this.comment.user_name || '匿名用戶')),
          h('button', {
            class: 'close-reply',
            on: {
              click: this.cancelReply
            }
          }, '×')
        ]),
        h('textarea', {
          domProps: {
            value: this.replyContent
          },
          class: 'reply-input',
          attrs: {
            placeholder: '寫下你的回復...',
            rows: 3
          },
          on: {
            input: (e) => {
              this.replyContent = e.target.value;
            },
            keydown: (e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                this.submitReply();
              }
            }
          }
        }),
        h('div', { class: 'reply-footer' }, [
          h('span', { class: 'reply-tip' }, 'Ctrl + Enter 快速發送'),
          h('div', { class: 'reply-actions' }, [
            h('button', {
              class: 'btn btn-outline btn-small',
              on: {
                click: this.cancelReply
              }
            }, '取消'),
            h('button', {
              class: 'btn btn-primary btn-small',
              attrs: {
                disabled: !this.replyContent.trim()
              },
              on: {
                click: this.submitReply
              }
            }, [
              h('span', { class: 'btn-icon' }, '📤'),
              '發送回復'
            ])
          ])
        ])
      ]);
    }

    // 8. 回復列表部分 - 使用平級顯示
    let repliesList = null;
    if (this.showReplies && this.comment.replies && this.comment.replies.length > 0) {
      repliesList = h('div', { class: 'replies-list replies-list-flat' }, 
        this.comment.replies.map(reply => 
          h(CommentItem, {
            props: {
              comment: reply,
              depth: this.depth + 1,
              isChildComment: true  // 標記為子評論
            },
            on: {
              reply: (comment, content) => this.$emit('reply', comment, content),
              like: (comment) => this.$emit('like', comment)
            }
          })
        )
      );
    }

    // 9. 返回完整的組件結構
    return h('div', {
      class: commentClasses
    }, [
      parentIndicator,   // 父評論指示器
      commentHeader,
      commentContent,
      commentFooter,
      replyForm,
      repliesList
    ]);
  }
};




export default {
  name: 'BlogList',
  components: {
    CommentItem
  },
  data() {
    return {
      blogs: [],
      loading: false,
      error: null,
      searchQuery: '',
      categoryFilter: '',
      selectedBlog: null,
      pagination: null,
      currentPage: 1,
      pageSize: 12,
      totalCount: 0,
      status: {
        message: '',
        type: ''
      },
      // 搜索相關數據
      searchLoading: false,
      hasSearched: false, // 標記是否已經執行過搜索
      // 評論區域相關數據
      showComments: false,
      newComment: '',
      isDarkMode: false,
      comments: [],
      commentsLoading: false,
      showFormatHelp: false,
      sortNewest: true,
      currentFilter: 'all',
      commentsPage: 1,
      commentsPerPage: 10,
      currentUser: null,


      currentMode: 'all', // 默認模式 增加模式操作 1
      isPersonalMode: false, // 是否個人模式
      personalStats: null, // 個人統計信息
      statusFilter: '', // 狀態篩選
      showDrafts: true, // 是否顯示草稿



    }
  },
  computed: {


    // 根據模式顯示不同標題 增加模式操作 2
    pageTitle() {
      const titles = {
        'all': '全部博客',
        'personal': '我的文章',
        'category': '分類文章'
      }
      return titles[this.currentMode] || '博客列表'
    },



    // 計算總評論數
    totalCommentCount() {
      let count = 0
      const countComments = (commentList) => {
        commentList.forEach(comment => {
          count++
          if (comment.replies && comment.replies.length > 0) {
            countComments(comment.replies)
          }
        })
      }
      countComments(this.comments)
      return count
    },
    
    displayedComments() {
      let filtered = [...this.comments]
      
      // 根據篩選條件排序
      if (this.currentFilter === 'popular') {
        filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      } else {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      
      // 分頁
      return filtered.slice(0, this.commentsPage * this.commentsPerPage)
    },
    
    hasMoreComments() {
      return this.displayedComments.length < this.comments.length
    },

    // 當前用戶信息
    currentUserName() {
      return this.currentUser?.username || '用戶'
    },

    currentUserAvatar() {
      return this.currentUser?.avatar || null
    },

    // 搜索結果數量
    filteredBlogsCount() {
      return this.blogs.length
    },

    // 是否有搜索結果
    hasSearchResults() {
      return this.hasSearched && this.searchQuery && this.blogs.length > 0
    }
  },
  mounted() {
    console.log('🔧 組件掛載完成')
    // 注意：fetchBlogs 現在在 handleRouteParams 中調用
    this.handleRouteParams()     //增加模式操作 4
    this.fetchBlogs()
    this.checkDarkModePreference()
    this.getCurrentUserInfo()

  },
  watch: {
    // 監聽路由變化 增加模式操作 3
    // 監聽路由變化 - 修改版本
    '$route': {
      handler(to, from) {
        console.log('🔄 檢測到路由變化')
        this.handleRouteParams()
      },
      immediate: false // 確保不在初始化時觸發
    },



    selectedBlog(newVal) {
      if (newVal && this.showComments) {
        this.fetchComments()
      }
    },
    showComments(newVal) {
      if (newVal && this.selectedBlog) {
        this.fetchComments()
      }
    }
  },
  methods: {



   

    // 編輯博客 - 直接傳遞數據
    editBlog() {
      if (!this.selectedBlog) {
        this.showStatus('請選擇要編輯的博客', 'warning')
        return
      }
      
      // 檢查用戶權限
      if (!this.isPersonalMode) {
        this.showStatus('只有作者可以編輯自己的博客', 'warning')
        return
      }
      
      console.log('🔄 進入編輯模式，博客ID:', this.selectedBlog.id)
      
      // 準備傳遞的數據（只傳遞必要的字段）
      const blogDataForEdit = {
        id: this.selectedBlog.id,
        title: this.selectedBlog.title || '',
        summary: this.selectedBlog.summary || '',
        content: this.selectedBlog.content || '',
        tags: this.selectedBlog.tags || [],
        category: this.selectedBlog.category || 'technology',
        visibility: this.selectedBlog.visibility || 'public',
        cover_image: this.selectedBlog.cover_image || '',
        status: this.selectedBlog.status || 'draft',
        author_name: this.selectedBlog.author_name || '',
        created_at: this.selectedBlog.created_at || '',
        updated_at: this.selectedBlog.updated_at || ''
      }
      
      // 使用 sessionStorage 傳遞數據（避免 URL 長度限制）
      const storageKey = `blog_edit_data_${this.selectedBlog.id}`
      sessionStorage.setItem(storageKey, JSON.stringify(blogDataForEdit))
      
      // 設置數據有效期時間戳（5分鐘）
      const expiryTime = Date.now() + 5 * 60 * 1000
      sessionStorage.setItem(`${storageKey}_expiry`, expiryTime.toString())
      
      console.log('📤 博客數據已保存到 sessionStorage:', blogDataForEdit.title)

      // 跳轉到編輯頁面
      this.$router.push({
        path: '/blogedit',
        query: {
          id: this.selectedBlog.id,
          mode: 'edit',
          source: 'list', // 標記數據來源
          timestamp: Date.now() // 防止緩存
        }
      })
    },



    // 在 BlogList.vue 的 methods 中添加
    async deleteBlog() {
      if (!this.selectedBlog) {
        this.showStatus('請選擇要刪除的博客', 'warning')
        return
      }
      
      // 确认删除
      if (!confirm(`確定要刪除博客 "${this.selectedBlog.title}" 嗎？此操作無法撤銷。`)) {
        return
      }
      
      this.showStatus('正在刪除...', 'info')
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/${this.selectedBlog.id}/delete/`
        
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
        
        if (!token) {
          this.showStatus('請先登錄', 'warning')
          return
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
        
        console.log('🗑️ 發送刪除請求:', url)
        
        const response = await fetch(url, {
          method: 'POST', // 根據您的後端，使用 POST 方法
          headers: headers
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP錯誤: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.showStatus(data.message || '博客刪除成功', 'success')
          
          // 關閉詳情頁
          this.closeDetail()
          
          // 重新加載博客列表
          await this.fetchBlogs()
          
          console.log('✅ 博客刪除成功')
        } else {
          throw new Error(data.message || '刪除失敗')
        }
        
      } catch (error) {
        console.error('刪除博客失敗:', error)
        
        // 更詳細的錯誤處理
        let errorMessage = '刪除失敗'
        if (error.message.includes('無權限')) {
          errorMessage = '您沒有權限刪除此博客'
        } else if (error.message.includes('不存在')) {
          errorMessage = '博客不存在或已被刪除'
        } else {
          errorMessage = `刪除失敗: ${error.message}`
        }
        
        this.showStatus(errorMessage, 'error')
      }
    },


    // 處理路由參數   增加模式操作 5
    // 處理路由參數 - 修改版本
    async handleRouteParams() {
      const { mode, labelId, categoryId } = this.$route.query
      
      console.log(`🔄 處理路由參數 - mode: ${mode}`)
      
      // 保存舊模式用於比較
      const oldMode = this.currentMode
      const oldIsPersonalMode = this.isPersonalMode
      
      // 設置當前模式
      this.currentMode = mode || 'all'
      
      // 根據模式設置相應的篩選條件
      if (mode === 'personal') {
        console.log('🔍 進入個人模式檢查流程')
        
        // 首先檢查token
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
        if (!token) {
          console.log('❌ 未找到token，無法進入個人模式')
          this.showStatus('請先登錄以查看個人文章', 'warning')
          // 自動跳轉回全部模式
          this.$router.replace('/bloglist?mode=all')
          return
        }
        
        console.log('✅ Token存在，繼續獲取用戶信息')


        // 檢查localStorage
        console.log('localStorage:', localStorage)
        console.log('userToken:', localStorage.getItem('userToken'))
        // 檢查sessionStorage
        console.log('sessionStorage:', sessionStorage)




        this.isPersonalMode = true
        
        // 嘗試獲取用戶信息（如果沒有）
        if (!this.currentUser || !this.currentUser.username) {
          console.log('🔄 嘗試獲取用戶信息...')
          const success = await this.getCurrentUserInfo()
          if (!success) {
            console.log('❌ 獲取用戶信息失敗，但繼續嘗試進入個人模式')
            // 即使獲取用戶信息失敗，也允許進入個人模式，讓後端處理授權
            this.isPersonalMode = true
          }
        }
      } else {
        this.isPersonalMode = false
        if (mode === 'category' && categoryId) {
          this.currentCategory = categoryId
        } else if (labelId) {
          this.currentLabel = labelId
        }
      }
      
      // 重置頁面
      this.currentPage = 1
      
      // 如果模式發生變化，重新獲取數據
      if (oldMode !== this.currentMode || oldIsPersonalMode !== this.isPersonalMode) {
        console.log(`🔄 模式變化，重新獲取數據: ${oldMode} -> ${this.currentMode}`)
        await this.fetchBlogs()
      }
    },



    // 獲取封面圖片URL
    getCoverImageUrl_bk(coverImage) {
      if (!coverImage) return null
      
      // 如果是完整的URL，直接返回
      if (coverImage.startsWith('http') || coverImage.startsWith('//')) {
        return coverImage
      }
      
      // 如果是相對路徑，拼接基礎URL
      const baseURL = this.$constant?.baseURL || ''
      if (coverImage.startsWith('/')) {
        return baseURL + coverImage
      }
      
      // 如果是文件名，假設在blog_covers目錄下
      return baseURL + '/media/blog_covers/' + coverImage
    },

    // 圖片加載錯誤處理
    handleImageError(event) {
      console.log('圖片加載失敗:', event.target.src)
      event.target.style.display = 'none'
    },


    // 獲取封面圖片URL
    getCoverImageUrl(coverImage) {
      if (!coverImage) return null
      
      console.log('原始封面图片URL:', coverImage)
      
      // 修复包含localhost的URL
      if (coverImage && coverImage.includes('localhost:8000')) {
        const constant = this.$constant || {}
        const mediaBaseURL = constant.webURL || window.location.origin
        const fixedUrl = coverImage.replace('http://localhost:8000', mediaBaseURL)
        console.log('修复后的URL:', fixedUrl)
        return fixedUrl
      }
      
      // 如果是完整的URL，直接返回
      if (coverImage.startsWith('http') || coverImage.startsWith('//')) {
        return coverImage
      }
      
      // 如果是相對路徑或文件名，使用原来的逻辑
      const constant = this.$constant || {}
      const mediaBaseURL = constant.webURL || window.location.origin
      
      if (coverImage.startsWith('/')) {
        return mediaBaseURL + coverImage
      }
      
      return mediaBaseURL + '/media/blog_covers/' + coverImage
    },







    // 獲取當前用戶信息
    async getCurrentUserInfo() {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
        if (!token) return

        // 先检查 Store 中是否已有用户信息
        if (this.$store.state.currentUser && this.$store.state.currentUser.id) {
          this.currentUser = this.$store.state.currentUser
          console.log('从 Store 获取用户信息:', this.currentUser.username)
          return // 如果 Store 中已有数据，直接使用，避免重复请求
        }

        const baseURL = this.$constant?.baseURL || ''
        const response = await fetch(`${baseURL}/user/profile/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            this.currentUser = data.data
            // 将用户信息保存到 Store
            this.$store.commit('loadCurrentUser', data.data)
            console.log('用户信息已保存到 Store:', data.data.name)
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    // 清除搜索狀態
    clearSearchStatus() {
      // 當用戶輸入時，清除搜索狀態標記
      this.hasSearched = false
    },

    // 搜索處理 - 只有手動觸發
    handleSearch() {
      if (!this.searchQuery.trim()) {
        // 如果搜索框為空，清除搜索狀態
        this.hasSearched = false
        this.fetchBlogs()
        return
      }
      
      this.currentPage = 1
      this.hasSearched = true // 標記已經執行搜索
      this.fetchBlogs()
    },

    // 清除搜索
    clearSearch() {
      this.searchQuery = ''
      this.categoryFilter = ''
      this.currentPage = 1
      this.hasSearched = false // 清除搜索狀態
      this.fetchBlogs()
    },

    // 分類篩選
    handleCategoryChange() {
      this.currentPage = 1
      this.fetchBlogs()
    },

    // 獲取博客列表
    async fetchBlogs() {
      this.loading = true
      this.searchLoading = true
      this.error = null
      
      try {
        const params = new URLSearchParams()

        // 個人模式參數 - 優化邏輯
        if (this.isPersonalMode) {
          console.log("🔍 進入個人模式，準備獲取個人文章")
          
          // 檢查用戶登錄狀態
          const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
          if (!token) {
            this.showStatus('請先登錄以查看個人文章', 'warning')
            this.loading = false
            this.searchLoading = false
            return
          }

          // 確保有當前用戶信息
          if (!this.currentUser || !this.currentUser.username) {
            console.log("🔄 獲取用戶信息...")
            const success = await this.getCurrentUserInfo()
            if (!success || !this.currentUser || !this.currentUser.username) {
              this.showStatus('無法獲取用戶信息，請先登錄', 'warning')
              this.loading = false
              this.searchLoading = false
              return
            }
          }

          console.log(`✅ 個人模式 - 用戶: ${this.currentUser.username}`)
          
          // 🔥 關鍵修改：只使用 my_blogs 參數，後端會自動過濾當前用戶的文章
          params.append('my_blogs', 'true')
          
          // 狀態篩選（個人模式專用）
          if (this.statusFilter) {
            params.append('status', this.statusFilter)
            console.log(`🔍 狀態篩選: ${this.statusFilter}`)
          }
          
          // 是否顯示草稿（個人模式專用）
          if (!this.showDrafts) {
            params.append('exclude_drafts', 'true')
            console.log("🔍 排除草稿模式")
          }
        } else {
          // 公共模式：只顯示已發布的文章
          console.log("🔍 進入公共模式，顯示所有已發布博客")
          params.append('status', 'published')
        }

        // 搜索和分類篩選（兩種模式都適用）
        if (this.searchQuery.trim()) {
          params.append('search', this.searchQuery.trim())
          console.log(`🔍 搜索關鍵詞: ${this.searchQuery.trim()}`)
        }
        
        if (this.categoryFilter) {
          params.append('category', this.categoryFilter)
          console.log(`🔍 分類篩選: ${this.categoryFilter}`)
        }
        
        // 分頁參數
        params.append('page', this.currentPage.toString())
        params.append('page_size', this.pageSize.toString())
        
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/?${params.toString()}`
        
        console.log(`🌐 請求URL: ${url}`)
        
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
        
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 添加認證頭部
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
          console.log(`✅ 獲取成功 - 模式: ${this.isPersonalMode ? '個人' : '公共'}, 數據量: ${data.data?.length || 0}`)
          
          // 🔥 關鍵修改：根據後端返回的數據直接使用，不需要前端再次過濾
          this.blogs = data.data || []
          this.pagination = data.pagination || null
          this.totalCount = data.count || data.pagination?.total_count || this.blogs.length
          
          // 更新個人統計信息（個人模式時）
          if (this.isPersonalMode) {
            this.updatePersonalStats()
          }
          
          // 搜索提示
          if (this.hasSearched && this.searchQuery.trim()) {
            if (this.blogs.length === 0) {
              this.showStatus(`沒有找到包含 "${this.searchQuery}" 的博客`, 'info')
            } else {
              this.showStatus(`找到 ${this.blogs.length} 篇相關博客`, 'success')
            }
          }
          
          // 調試信息
          if (this.blogs.length > 0) {
            console.log("📊 獲取的博客列表:")
            this.blogs.forEach(blog => {
              console.log(`  - ${blog.title} (狀態: ${blog.status}, 作者: ${blog.author_name})`)
            })
          }
        } else {
          throw new Error(data.message || '獲取博客列表失敗')
        }
      } catch (err) {
        console.error('獲取博客列表錯誤:', err)
        this.error = err.message
        this.blogs = []
        this.showStatus('加載失敗: ' + err.message, 'error')
      } finally {
        this.loading = false
        this.searchLoading = false
      }
    },

    // 🔥 新增：更新個人統計信息的方法
    // 更新個人統計信息的方法
    updatePersonalStats() {
      if (!this.isPersonalMode) {
        this.personalStats = null
        return
      }
      
      const total = this.blogs.length
      const published = this.blogs.filter(blog => blog.status === 'published').length
      const drafts = this.blogs.filter(blog => blog.status === 'draft').length
      
      this.personalStats = {
        total,
        published,
        drafts
      }
      console.log(`📈 個人統計 - 總數: ${total}, 已發布: ${published}, 草稿: ${drafts}`)
    },




    // 模式切換方法
    // 模式切換方法 - 修改版本
    switchMode(mode) {
      console.log(`🔄 手動切換模式: ${mode}`)
      
      // 如果切換到個人模式，檢查登錄狀態
      if (mode === 'personal') {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
        if (!token) {
          this.showStatus('請先登錄以查看個人文章', 'warning')
          return
        }
      }
      
      // 使用路由跳轉來切換模式
      this.$router.push({
        path: '/bloglist',
        query: { mode }
      })
      // 注意：不需要手動調用 fetchBlogs，因為路由變化會觸發 handleRouteParams
    },




    // 查看博客詳情
    async viewBlogDetail(blogId) {
      if (!blogId) {
        this.showStatus('無效的博客ID', 'error')
        return
      }
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/${blogId}/`
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
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
          this.selectedBlog = data.data
          window.scrollTo(0, 0)
        } else {
          throw new Error(data.message || '獲取博客詳情失敗')
        }
      } catch (error) {
        console.error('加載博客詳情失敗:', error)
        this.showStatus('加載失敗: ' + error.message, 'error')
      }
    },





    // 點讚博客
    async likeBlog() {
      if (!this.selectedBlog) return
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/${this.selectedBlog.id}/like/`
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        if (!token) {
          this.showStatus('請先登錄', 'warning')
          return
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: headers
        })
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.selectedBlog.is_liked = data.is_liked
          this.selectedBlog.like_count = data.like_count
          this.showStatus(data.message, 'success')
        } else {
          throw new Error(data.message || '操作失敗')
        }
      } catch (error) {
        console.error('點讚操作失敗:', error)
        this.showStatus('操作失敗: ' + error.message, 'error')
      }
    },

    // 收藏博客
    async bookmarkBlog() {
      if (!this.selectedBlog) return
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/${this.selectedBlog.id}/collect/`
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        if (!token) {
          this.showStatus('請先登錄', 'warning')
          return
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: headers
        })
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.selectedBlog.is_collected = data.is_collected
          this.showStatus(data.message, 'success')
        } else {
          throw new Error(data.message || '操作失敗')
        }
      } catch (error) {
        console.error('收藏操作失敗:', error)
        this.showStatus('操作失敗: ' + error.message, 'error')
      }
    },

    // 獲取評論
    async fetchComments() {
      if (!this.selectedBlog) return
      
      this.commentsLoading = true
      this.commentsPage = 1
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const timestamp = new Date().getTime()
        const url = `${baseURL}/blogs/${this.selectedBlog.id}/comments/?_t=${timestamp}`
        
        console.log('🔄 獲取評論列表...')
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        const headers = {
          'Content-Type': 'application/json'
        }
        
        if (token) {
          headers['Authorization'] = `Token ${token}`
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          cache: 'no-cache'
        })
        
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ 獲取評論成功，數據長度:', data.data?.length || 0)
          this.comments = this.initializeCommentProperties(data.data || [])
        } else {
          throw new Error(data.message || '獲取評論失敗')
        }
      } catch (error) {
        console.error('獲取評論失敗:', error)
        this.showStatus('獲取評論失敗: ' + error.message, 'error')
      } finally {
        this.commentsLoading = false
      }
    },

    // 初始化評論屬性
    initializeCommentProperties(comments) {
      return comments.map(comment => {
        const safeComment = {
          id: comment.id || 0,
          user_name: comment.user_name || '匿名用戶',
          user_avatar: comment.user_avatar || null, // 確保頭像字段被保留
          content: comment.content || '',
          like_count: comment.like_count || 0,
          is_liked: comment.is_liked || false,
          created_at: comment.created_at || new Date().toISOString(),
          replies: comment.replies || [],
          showReply: false,
          replyContent: '',
          showReplies: false,
          reply_count: comment.reply_count || 0,
          is_author: comment.is_author || false
        }
        
        // 遞歸初始化子評論
        if (safeComment.replies && safeComment.replies.length > 0) {
          safeComment.replies = this.initializeCommentProperties(safeComment.replies)
        }
        
        return safeComment
      })
    },

    // 發表評論
    async submitComment() {
      if (!this.newComment.trim()) {
        this.showStatus('請輸入評論內容', 'warning')
        return
      }
      
      if (!this.selectedBlog) return
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/blogs/${this.selectedBlog.id}/comments/`
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        if (!token) {
          this.showStatus('請先登錄', 'warning')
          return
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            content: this.newComment.trim()
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.newComment = ''
          this.showStatus('評論發表成功', 'success')
          await this.fetchComments()
          this.selectedBlog.comment_count = (this.selectedBlog.comment_count || 0) + 1
        } else {
          throw new Error(data.message || '發表評論失敗')
        }
      } catch (error) {
        console.error('發表評論失敗:', error)
        this.showStatus('發表評論失敗: ' + error.message, 'error')
      }
    },

    // 點讚評論
    async likeComment(comment) {
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/comments/${comment.id}/like/`
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        if (!token) {
          this.showStatus('請先登錄', 'warning')
          return
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: headers
        })
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          comment.is_liked = data.is_liked
          comment.like_count = data.like_count
          this.showStatus(data.message, 'success')
        } else {
          throw new Error(data.message || '操作失敗')
        }
      } catch (error) {
        console.error('點讚評論失敗:', error)
        this.showStatus('操作失敗: ' + error.message, 'error')
      }
    },

    // 處理回復事件
    handleReply(comment, content) {
      this.submitReplyToComment(comment, content)
    },
    
    // 處理點讚事件
    handleLike(comment) {
      this.likeComment(comment)
    },
    
    // 提交回復
    async submitReplyToComment(comment, content) {
      if (!content?.trim()) {
        this.showStatus('請輸入回復內容', 'warning')
        return
      }
      
      try {
        const baseURL = this.$constant?.baseURL || ''
        const url = `${baseURL}/comments/reply/`
        
        const token = localStorage.getItem('userToken') || 
                      sessionStorage.getItem('userToken')
        
        if (!token) {
          this.showStatus('請先登錄', 'warning')
          return
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
        
        console.log('📤 發送回復請求...')
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            blog: this.selectedBlog.id,
            parent: comment.id,
            content: content.trim()
          })
        })
        
        const responseData = await response.json()
        
        if (!response.ok) {
          throw new Error(responseData.message || `HTTP錯誤: ${response.status}`)
        }
        
        if (responseData.success) {
          this.showStatus('回復成功', 'success')
          // 強制刷新評論列表
          await this.fetchComments()
        } else {
          throw new Error(responseData.message || '回復失敗')
        }
      } catch (error) {
        console.error('回復失敗:', error)
        this.showStatus('回復失敗: ' + error.message, 'error')
      }
    },

    // 評論區域新方法
    onCommentFocus() {
      this.showFormatHelp = true
    },
    
    onCommentBlur() {
      setTimeout(() => {
        this.showFormatHelp = false
      }, 200)
    },
    
    insertFormat(before, after) {
      const textarea = this.$el?.querySelector('.modern-textarea')
      if (!textarea) return
      
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = this.newComment.substring(start, end)
      
      this.newComment = 
        this.newComment.substring(0, start) +
        before + selectedText + after +
        this.newComment.substring(end)
      
      // 重新聚焦並設置光標位置
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    },
    
    toggleSort() {
      this.sortNewest = !this.sortNewest
      this.currentFilter = this.sortNewest ? 'all' : 'popular'
    },
    
    refreshComments() {
      this.fetchComments()
    },
    
    focusCommentInput() {
      const textarea = this.$el?.querySelector('.modern-textarea')
      if (textarea) {
        textarea.focus()
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    
    loadMoreComments() {
      this.commentsPage++
    },

    // 展開/收起子評論
    toggleReplies(comment) {
      comment.showReplies = !comment.showReplies
    },

    // 關閉詳情頁
    closeDetail() {
      this.selectedBlog = null
      this.showComments = false
      this.comments = []
      this.commentsPage = 1
    },

    // 分頁
    changePage(page) {
      if (page < 1) return
      this.currentPage = page
      this.fetchBlogs()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    // 分享博客
    shareBlog() {
      if (this.selectedBlog) {
        const url = window.location.origin + `/blog/${this.selectedBlog.id}/`
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            this.showStatus('鏈接已複製到剪貼板', 'success')
          })
        } else {
          prompt('複製以下鏈接分享：', url)
        }
      }
    },

    // 切換暗黑模式
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      document.body.classList.toggle('dark-mode', this.isDarkMode)
      localStorage.setItem('darkMode', this.isDarkMode)
    },

    // 檢查暗黑模式偏好
    checkDarkModePreference() {
      const saved = localStorage.getItem('darkMode')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.isDarkMode = saved ? JSON.parse(saved) : prefersDark
      document.body.classList.toggle('dark-mode', this.isDarkMode)
    },

    // 打印
    printBlog() {
      window.print()
    },

    // 切換評論顯示
    toggleComments() {
      this.showComments = !this.showComments
    },

    // 取消評論
    cancelComment() {
      this.newComment = ''
    },

    // 工具方法
    getCategoryLabel(category) {
      const labels = {
        technology: '技術',
        life: '生活',
        design: '設計',
        other: '其他'
      }
      return labels[category] || category
    },

    getCategoryClass(category) {
      return `category-${category}`
    },

    getContentPreview(content) {
      if (!content) return '暫無內容'
      const text = content.replace(/<[^>]*>/g, '')
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    },

    formatDate(dateString) {
      if (!dateString) return '未知時間'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN')
      } catch {
        return '未知時間'
      }
    },

    formatDetailDate(dateString) {
      if (!dateString) return '未知時間'
      try {
        const date = new Date(dateString)
        return date.toLocaleString('zh-CN')
      } catch {
        return '未知時間'
      }
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
/* 搜索提示樣式改進 */
.search-tips {
  font-size: 12px;
  color: #6c757d;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  display: inline-block;
  margin-top: 8px;
}

.search-tips.no-results {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.search-tips .search-result {
  font-weight: 600;
  color: #28a745;
}

.search-tips.no-results .search-result {
  color: #dc3545;
}

body.dark-mode .search-tips {
  background: #2d2d2d;
  color: #a0aec0;
}

body.dark-mode .search-tips.no-results {
  background: #4a3c1a;
  color: #ffc107;
  border-color: #856404;
}

/*增加tag....................*/

/* 主組件的樣式 - 保持scoped */
.blog-container {
  min-height: 100vh;
  background: #ffffff;
  transition: all 0.3s ease;
  padding-top: 40px;
}

body.dark-mode .blog-container {
  background: #1a1a1a;
  color: #e0e0e0;
}

/* 列表頁樣式 */
.blog-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 60px 20px;
  color: #dc3545;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}

/* 控制區域 */
.blog-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  width: 300px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  outline: none;
}

.search-btn, .clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-btn {
  background: #007bff;
  color: white;
}

.search-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  background: #6c757d;
  color: white;
}

.clear-btn:hover:not(:disabled) {
  background: #545b62;
}

.search-loading {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-tips {
  font-size: 12px;
  color: #6c757d;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  display: inline-block;
}

body.dark-mode .search-tips {
  background: #2d2d2d;
  color: #a0aec0;
}

.category-select {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
}

.stats-section {
  color: #6c757d;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result-count {
  color: #28a745;
  font-weight: 500;
}

body.dark-mode .search-result-count {
  color: #4caf50;
}

/* 博客列表 */
.blog-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.blog-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

body.dark-mode .blog-card {
  background: #2d2d2d;
  border-color: #404040;
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #007bff;
}

/* 封面圖片樣式 */
.blog-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blog-card:hover .cover-image {
  transform: scale(1.05);
}

.blog-content-wrapper {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.blog-title {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
  line-height: 1.4;
  flex: 1;
  margin-right: 15px;
}

body.dark-mode .blog-title {
  color: #e0e0e0;
}

.blog-category {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.category-technology { background: #e3f2fd; color: #1976d2; }
.category-life { background: #f3e5f5; color: #7b1fa2; }
.category-design { background: #e8f5e8; color: #388e3c; }
.category-other { background: #fff3e0; color: #f57c00; }

body.dark-mode .category-technology { background: #1e3a5f; color: #90caf9; }
body.dark-mode .category-life { background: #4a235a; color: #e1bee7; }
body.dark-mode .category-design { background: #1b5e20; color: #a5d6a7; }
body.dark-mode .category-other { background: #e65100; color: #ffcc80; }

.blog-summary, .blog-content-preview {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

body.dark-mode .blog-summary,
body.dark-mode .blog-content-preview {
  color: #a0aec0;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #a0aec0;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}

.blog-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.blog-tag {
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

body.dark-mode .blog-tag {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.blog-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.reading-time {
  background: #e7f3ff;
  padding: 2px 8px;
  border-radius: 12px;
  color: #1976d2;
}

body.dark-mode .reading-time {
  background: #1e3a5f;
  color: #90caf9;
}

.visibility.public {
  color: #28a745;
}
.visibility.private {
  color: #dc3545;
}

/* 空狀態 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e9ecef;
}

body.dark-mode .empty-state {
  background: #2d2d2d;
  border-color: #404040;
  color: #a0aec0;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #495057;
}

body.dark-mode .empty-state h3 {
  color: #e0e0e0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.7;
}

/* 分頁 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

/* 🎯 頁碼文字樣式 */
.page-info {
  font-size: 16px;
  color: #333333;
  font-weight: 600;
  font-family: 'Microsoft YaHei', sans-serif;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

body.dark-mode .page-info {
  color: #ffffff;
  background: #2d2d2d;
}

body.dark-mode .pagination-btn {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 詳情頁樣式 */
.blog-detail-fullscreen {
  min-height: 100vh;
  background: #ffffff;
}

body.dark-mode .blog-detail-fullscreen {
  background: #1a1a1a;
  color: #e0e0e0;
}

.detail-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

body.dark-mode .detail-header {
  background: #2d2d2d;
  border-bottom-color: #404040;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: #0056b3;
}




.detail-actions {
  display: flex; /* 改用 flex 布局 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.personal-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap; /* 防止文字换行 */
}

.action-btn:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

/* 响应式设计 - 在小屏幕上自动换行 */
@media (max-width: 768px) {
  .detail-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 10px;
    font-size: 14px;
  }
}





.detail-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 文章樣式 */
.blog-article {
  line-height: 1.8;
}

.article-header {
  margin-bottom: 40px;
}

/* 詳情頁封面圖片 */
.article-cover {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cover-image-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-meta-top {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.category-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.reading-time-full {
  background: #e7f3ff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #1976d2;
}

body.dark-mode .reading-time-full {
  background: #1e3a5f;
  color: #90caf9;
}

.article-title {
  font-size: 2.5em;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #1a1a1a;
}

body.dark-mode .article-title {
  color: #ffffff;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

body.dark-mode .article-meta {
  border-bottom-color: #404040;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.author-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-avatar .avatar-placeholder {
  font-size: 20px;
}

.author-name {
  font-weight: 500;
  color: #666;
}

body.dark-mode .author-name {
  color: #b0b0b0;
}

.publish-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.publish-date {
  color: #666;
  font-size: 14px;
}

body.dark-mode .publish-date {
  color: #b0b0b0;
}

.visibility-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.visibility-badge.public {
  background: #d4edda;
  color: #155724;
}
.visibility-badge.private {
  background: #f8d7da;
  color: #721c24;
}

body.dark-mode .visibility-badge.public {
  background: #1e3a2c;
  color: #4caf50;
}
body.dark-mode .visibility-badge.private {
  background: #4a2323;
  color: #f44336;
}

.article-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tag-item {
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #495057;
  border: 1px solid #e9ecef;
}

body.dark-mode .tag-item {
  background: #2d2d2d;
  color: #e0e0e0;
  border-color: #404040;
}

.article-summary {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #007bff;
  margin-bottom: 32px;
}

body.dark-mode .article-summary {
  background: #2d2d2d;
  border-left-color: #1976d2;
}

.summary-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  font-size: 14px;
}

body.dark-mode .summary-label {
  color: #b0b0b0;
}

.article-summary p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

body.dark-mode .article-summary p {
  color: #b0b0b0;
}

.article-content {
  font-size: 1.125em;
  line-height: 1.8;
  color: #2d3748;
}

body.dark-mode .article-content {
  color: #e0e0e0;
}

.article-footer {
  margin-top: 60px;
  padding-top: 30px;
  border-top: 1px solid #e9ecef;
}

body.dark-mode .article-footer {
  border-top-color: #404040;
}

.article-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.article-action-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 14px;
}

.article-action-btn:hover {
  background: #e9ecef;
}

body.dark-mode .article-action-btn {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

body.dark-mode .article-action-btn:hover {
  background: #404040;
}

.article-action-btn.liked {
  background: #ffe6e6;
  border-color: #ff6b6b;
  color: #dc3545;
}

.article-action-btn.collected {
  background: #fff3cd;
  border-color: #ffd351;
  color: #856404;
}

body.dark-mode .article-action-btn.liked {
  background: #4a2323;
  border-color: #f44336;
  color: #f44336;
}

body.dark-mode .article-action-btn.collected {
  background: #4a3c1a;
  border-color: #ffc107;
  color: #ffc107;
}

.update-info {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

body.dark-mode .update-info {
  color: #8a8a8a;
}

/* 現代化評論區域樣式 */
.modern-comments {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

body.dark-mode .modern-comments {
  border-top-color: #404040;
}

/* 評論區域頭部 */
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

body.dark-mode .comments-header {
  border-bottom-color: #333;
}

.comments-title-section h2 {
  margin: 0 0 8px 0;
  font-size: 1.75em;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

body.dark-mode .comments-title-section h2 {
  color: #ffffff;
}

.comments-stats {
  display: flex;
  gap: 16px;
  color: #6c757d;
  font-size: 14px;
}

body.dark-mode .comments-stats {
  color: #a0aec0;
}

.comments-actions {
  display: flex;
  gap: 12px;
}

.sort-btn, .refresh-btn {
  padding: 8px 16px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

body.dark-mode .sort-btn,
body.dark-mode .refresh-btn {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.sort-btn:hover, .refresh-btn:hover {
  border-color: #007bff;
  transform: translateY(-1px);
}

/* 評論發表卡片 */
.comment-publish-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

body.dark-mode .comment-publish-card {
  background: #2d2d2d;
  border-color: #404040;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.comment-publish-card:focus-within {
  box-shadow: 0 8px 30px rgba(0, 123, 255, 0.15);
  border-color: #007bff;
}

body.dark-mode .comment-publish-card:focus-within {
  box-shadow: 0 8px 30px rgba(0, 123, 255, 0.25);
}

.publish-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar .avatar-placeholder {
  font-size: 20px;
  color: white;
}

.publish-info h4 {
  margin: 0 0 4px 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
}

body.dark-mode .publish-info h4 {
  color: #ffffff;
}

.publish-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

body.dark-mode .publish-info p {
  color: #a0aec0;
}

/* 文本輸入框 */
.modern-textarea {
  width: 100%;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.3s ease;
  background: white;
  color: #495057;
  resize: vertical;
  min-height: 120px;
}

.modern-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

body.dark-mode .modern-textarea {
  background: #1a1a1a;
  border-color: #404040;
  color: #e0e0e0;
}

body.dark-mode .modern-textarea:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
}

.format-help {
  margin-top: 8px;
}

.format-tip {
  font-size: 12px;
  color: #6c757d;
}

body.dark-mode .format-tip {
  color: #8a8a8a;
}

/* 發布底部 */
.publish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.comment-tools {
  display: flex;
  gap: 8px;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

body.dark-mode .tool-btn {
  background: #404040;
  border-color: #555;
  color: #e0e0e0;
}

body.dark-mode .tool-btn:hover {
  border-color: #1976d2;
  background: #333;
}

.publish-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-length {
  font-size: 12px;
  color: #6c757d;
}

.length-warning {
  color: #ff6b6b;
  font-weight: 600;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-small {
  padding: 8px 16px;
  font-size: 12px;
}

.publish-btn.pulsing {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 評論列表容器 */
.comments-list-container {
  position: relative;
}

.comments-loading {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-wave {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 16px;
}

.wave-bar {
  width: 4px;
  height: 20px;
  background: #007bff;
  border-radius: 2px;
  animation: wave 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(2) { animation-delay: -1.1s; }
.wave-bar:nth-child(3) { animation-delay: -1.0s; }
.wave-bar:nth-child(4) { animation-delay: -0.9s; }
.wave-bar:nth-child(5) { animation-delay: -0.8s; }

@keyframes wave {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

/* 空狀態 */
.empty-comments {
  text-align: center;
  padding: 80px 20px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px dashed #e9ecef;
}

body.dark-mode .empty-comments {
  background: #2d2d2d;
  border-color: #404040;
}

.empty-illustration {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-comments h3 {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-weight: 600;
}

body.dark-mode .empty-comments h3 {
  color: #a0aec0;
}

.empty-comments p {
  margin: 0 0 20px 0;
  color: #6c757d;
}

body.dark-mode .empty-comments p {
  color: #8a8a8a;
}

/* 評論過濾器 */
.comments-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

body.dark-mode .comments-filter {
  background: #252525;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

body.dark-mode .filter-tab {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.filter-tab.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.filter-tab:hover:not(.active) {
  border-color: #007bff;
}

.filter-stats {
  font-size: 12px;
  color: #6c757d;
}

body.dark-mode .filter-stats {
  color: #a0aec0;
}

/* 評論項目過渡 */
.comment-fade-enter-active,
.comment-fade-leave-active {
  transition: all 0.5s ease;
}

.comment-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.comment-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 加載更多 */
.load-more-section {
  text-align: center;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e9ecef;
}

body.dark-mode .load-more-section {
  border-top-color: #404040;
}

.load-more-btn {
  padding: 12px 32px;
  border: 2px solid #007bff;
  background: transparent;
  color: #007bff;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* 狀態提示 */
.status-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1001;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.status-success {
  background: rgba(212, 237, 218, 0.95);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background: rgba(248, 215, 218, 0.95);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-warning {
  background: rgba(255, 243, 205, 0.95);
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-info {
  background: rgba(209, 236, 241, 0.95);
  color: #0c5460;
  border: 1px solid #bee5eb;
}

body.dark-mode .status-success {
  background: rgba(30, 58, 44, 0.95);
  color: #4caf50;
}

body.dark-mode .status-error {
  background: rgba(74, 35, 35, 0.95);
  color: #f44336;
}

body.dark-mode .status-warning {
  background: rgba(74, 60, 26, 0.95);
  color: #ffc107;
}

body.dark-mode .status-info {
  background: rgba(30, 58, 74, 0.95);
  color: #2196f3;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .blog-list {
    grid-template-columns: 1fr;
  }
  
  .blog-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-wrapper .search-input {
    width: 100%;
  }
  
  .blog-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .blog-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-main {
    padding: 20px 15px;
  }
  
  .article-title {
    font-size: 2em;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .detail-actions {
    justify-content: center;
  }
  
  .article-actions {
    justify-content: center;
  }
  
  /* 封面圖片響應式 */
  .blog-cover {
    height: 160px;
  }
  
  .article-cover {
    height: 250px;
  }
  
  /* 評論區域響應式 */
  .comments-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .comments-actions {
    justify-content: flex-end;
  }
  
  .publish-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .comment-tools {
    justify-content: center;
  }
  
  .publish-actions {
    justify-content: space-between;
  }
  
  .comments-filter {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .filter-tabs {
    justify-content: center;
  }
}

/* 打印樣式 */
@media print {
  .detail-header,
  .article-footer,
  .comments-section {
    display: none;
  }
  
  .blog-detail-fullscreen {
    background: white !important;
    color: black !important;
  }
  
  .article-content {
    font-size: 12pt;
    line-height: 1.6;
  }
}
</style>

<style>
/* 評論組件專用樣式 - 全局樣式 */

/* 評論項目 */
.modern-comment-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
}

.modern-comment-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

body.dark-mode .modern-comment-item {
  background: #2d2d2d;
  border-color: #404040;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.dark-mode .modern-comment-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* 嵌套評論 */
.nested-comment {
  position: relative;
  margin-left: 24px;
  border-left: 3px solid #e9ecef;
  padding-left: 16px;
  background: #fafafa;
}

body.dark-mode .nested-comment {
  border-left-color: #404040;
  background: #252525;
}

.deep-nested {
  margin-left: 20px;
  background: #f5f5f5;
}

body.dark-mode .deep-nested {
  background: #202020;
}

/* 評論頭部 - 修復頭像顯示 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.user-name {
  color: #333333 !important;
  font-weight: 600;
  font-size: 14px;
}

body.dark-mode .user-name {
  color: #ffffff !important;
}

.user-badge {
  background: #007bff;
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.comment-time {
  color: #666666 !important;
  font-size: 11px;
}

body.dark-mode .comment-time {
  color: #a0aec0 !important;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 16px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s ease;
  color: #6c757d;
}

.comment-like-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.comment-like-btn.liked {
  background: #ffe6e6;
  border-color: #ff6b6b;
  color: #dc3545;
}

body.dark-mode .comment-like-btn {
  background: #404040;
  border-color: #555;
  color: #a0aec0;
}

body.dark-mode .comment-like-btn:hover {
  border-color: #f44336;
  color: #f44336;
}

body.dark-mode .comment-like-btn.liked {
  background: #4a2323;
  border-color: #f44336;
  color: #f44336;
}

.comment-menu-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  color: #6c757d;
}

.comment-menu-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

body.dark-mode .comment-menu-btn {
  background: #404040;
  border-color: #555;
  color: #a0aec0;
}

/* 評論內容 */
.comment-content {
  position: relative;
  margin-bottom: 12px;
}

.content-text {
  color: #333333 !important;
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
}

body.dark-mode .content-text {
  color: #e0e0e0 !important;
}

.collapsed-content {
  max-height: 60px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

.expand-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(248, 249, 250, 0.9));
  padding: 20px 0 8px 0;
  text-align: center;
  cursor: pointer;
  color: #007bff;
  font-size: 12px;
  font-weight: 500;
}

body.dark-mode .expand-overlay {
  background: linear-gradient(transparent, rgba(45, 45, 45, 0.9));
}

/* 評論底部 */
.comment-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reply-btn, .toggle-replies-btn {
  background: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.reply-btn:hover, .toggle-replies-btn:hover {
  background: #e7f3ff;
}

body.dark-mode .reply-btn,
body.dark-mode .toggle-replies-btn {
  color: #90caf9;
}

body.dark-mode .reply-btn:hover,
body.dark-mode .toggle-replies-btn:hover {
  background: #1e3a5f;
}

.toggle-replies-btn.expanded {
  background: #e7f3ff;
  color: #0056b3;
}

body.dark-mode .toggle-replies-btn.expanded {
  background: #1e3a5f;
  color: #90caf9;
}

/* 回復表單 */
.reply-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  border: 1px solid #e9ecef;
}

body.dark-mode .reply-form {
  background: #252525;
  border-color: #404040;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-to {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

body.dark-mode .reply-to {
  color: #a0aec0;
}

.close-reply {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6c757d;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.close-reply:hover {
  background: #e9ecef;
  color: #dc3545;
}

body.dark-mode .close-reply:hover {
  background: #404040;
}

.reply-input {
  width: 100%;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  background: white;
  color: #333333;
  min-height: 60px;
}

body.dark-mode .reply-input {
  background: #1a1a1a;
  border-color: #404040;
  color: #e0e0e0;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.reply-tip {
  font-size: 10px;
  color: #6c757d;
}

body.dark-mode .reply-tip {
  color: #8a8a8a;
}

.reply-actions {
  display: flex;
  gap: 6px;
}

/* 回復列表 */
.replies-list {
  margin-top: 12px;
}

/* 嵌套評論中的字體顏色修復 */
.nested-comment .user-name,
.deep-nested .user-name {
  color: #333333 !important;
}

body.dark-mode .nested-comment .user-name,
body.dark-mode .deep-nested .user-name {
  color: #e0e0e0 !important;
}

.nested-comment .content-text,
.deep-nested .content-text {
  color: #333333 !important;
}

body.dark-mode .nested-comment .content-text,
body.dark-mode .deep-nested .content-text {
  color: #e0e0e0 !important;
}

.nested-comment .comment-time,
.deep-nested .comment-time {
  color: #666666 !important;
}

body.dark-mode .nested-comment .comment-time,
body.dark-mode .deep-nested .comment-time {
  color: #a0aec0 !important;
}




/*****************20251204增加評級評論功能*************************/
/* 平級評論系統樣式 */
.modern-comment-item.top-level {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  border-left: 4px solid #007bff;
}

.modern-comment-item.child-comment {
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 3px solid #28a745;
  position: relative;
  padding-left: 12px;
}

/* 父評論指示器 */
.parent-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 4px;
}

.indicator-icon {
  font-weight: bold;
}

.indicator-text {
  font-style: italic;
}

/* 平級回復列表 */
.replies-list-flat {
  margin-top: 16px;
  padding-left: 0;
  border-top: 1px dashed #e9ecef;
  padding-top: 12px;
}

.replies-list-flat .modern-comment-item {
  margin-bottom: 10px;
}

/* 連接線效果 */
.child-comment::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20px;
  bottom: -20px;
  width: 2px;
  background: #dee2e6;
}

.child-comment:last-child::before {
  display: none;
}

/* 箭頭指示器 */
.child-comment::after {
  content: '↳';
  position: absolute;
  left: -12px;
  top: 16px;
  color: #6c757d;
  font-size: 14px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .modern-comment-item.child-comment {
    margin-left: 0;
    padding-left: 10px;
  }
  
  .child-comment::before {
    left: -10px;
  }
  
  .child-comment::after {
    left: -18px;
  }
}

/* 暗色模式支持 */
body.dark-mode .modern-comment-item.top-level {
  background: #2d2d2d;
  border-left-color: #1976d2;
}

body.dark-mode .modern-comment-item.child-comment {
  background: #252525;
  border-left-color: #4caf50;
}

body.dark-mode .parent-indicator {
  background: #404040;
  color: #a0aec0;
}

body.dark-mode .child-comment::before {
  background: #404040;
}

body.dark-mode .replies-list-flat {
  border-top-color: #404040;
}












</style>