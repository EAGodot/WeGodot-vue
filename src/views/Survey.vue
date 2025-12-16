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

      <i
        class="el-icon-arrow-down"
        @click="navigation('.survey-container')"
      ></i>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载问卷...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>加载问卷失败</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadSurveyData">重试</button>
    </div>

    <!-- 问卷未发布状态 -->
    <div v-else-if="surveyNotActive" class="inactive-container">
      <div class="inactive-icon">📋</div>
      <h3>问卷未发布或已结束</h3>
      <p>该问卷当前不可用，请稍后再试或联系管理员</p>
    </div>

    <!-- 调查问卷部分 -->
    <div v-else class="survey-container" ref="surveyContainer">
      <div class="survey-header">
        <h2>{{ surveyData.title }}</h2>
        <p>{{ surveyData.description }}</p>
      </div>

      <div class="questions-container">
        <!-- 选择题部分 -->
        <div 
          v-for="(question, index) in multipleChoiceQuestions" 
          :key="'mc-' + question.id"
          class="question-item"
        >
          <div class="question-header">
            <span class="question-number">Q{{ index + 1 }}</span>
            <div class="question-text-container">
              <span class="question-text">{{ question.text }}</span>
              <span v-if="question.required" class="required-mark">*</span>
            </div>
          </div>
          
          <div class="options-container">
            <div 
              v-for="(option, optIndex) in question.options" 
              :key="'opt-' + optIndex"
              class="option-item"
            >
              <input
                :type="question.type === 'single' ? 'radio' : 'checkbox'"
                :name="'question-' + question.id"
                :id="'q' + question.id + '-opt' + optIndex"
                :value="option.value"
                v-model="question.answer"
                @change="validateQuestion(question)"
                class="option-input"
              >
              <label :for="'q' + question.id + '-opt' + optIndex" class="option-label">
                <span class="option-checkbox"></span>
                <span class="option-text">{{ option.text }}</span>
              </label>
            </div>
          </div>
          
          <div v-if="question.error" class="error-message">{{ question.error }}</div>
        </div>

        <!-- 论述题部分 -->
        <div 
          v-for="(question, index) in essayQuestions" 
          :key="'essay-' + question.id"
          class="question-item essay-question"
        >
          <div class="question-header">
            <span class="question-number">Q{{ multipleChoiceQuestions.length + index + 1 }}</span>
            <div class="question-text-container">
              <span class="question-text">{{ question.text }}</span>
              <span v-if="question.required" class="required-mark">*</span>
            </div>
          </div>
          
          <!-- 回答按钮 -->
          <div class="answer-button-container">
            <button
              class="answer-btn"
              @click="openEssayDialog(question)"
              :class="{ 'answered': question.answer }"
            >
              {{ question.answer ? '修改回答' : '开始回答' }}
            </button>
            
            <!-- 回答预览 -->
            <div v-if="question.answer" class="answer-preview">
              <p>{{ question.answerPreview }}</p>
            </div>
          </div>
          
          <div v-if="question.error" class="error-message">{{ question.error }}</div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="survey-footer">
        <div class="anonymous-option" v-if="surveyData.settings?.allow_anonymous">
          <input
            type="checkbox"
            id="anonymous-submit"
            v-model="isAnonymous"
            class="anonymous-checkbox"
          >
          <label for="anonymous-submit" class="anonymous-label">匿名提交</label>
        </div>
        <button class="submit-btn" @click="submitSurvey" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交问卷' }}
        </button>
      </div>

      <!-- 论述题弹窗 -->
      <el-dialog
        :title="currentEssayQuestion ? '回答: ' + currentEssayQuestion.text : ''"
        :visible.sync="showEssayDialog"
        :width="dialogWidth"
        :append-to-body="true"
        destroy-on-close
        center
        custom-class="essay-dialog mobile-dialog"
      >
        <div class="essay-dialog-content">
          <!-- 评论框 -->
          <textarea
            class="comment-textarea"
            v-model="essayAnswer"
            :placeholder="essayPlaceholder"
            maxlength="1000"
          />
          
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <button 
                class="tool-btn"
                @click="showEmoji = !showEmoji"
                :class="{ 'active': showEmoji }"
              >
                😊
              </button>
              <button class="tool-btn" @click="openPicture()">
                📷
              </button>
            </div>

            <div class="toolbar-right">
              <span class="char-count">{{ essayAnswer.length }}/1000</span>
              <button class="save-btn" @click="saveEssayAnswer">
                保存回答
              </button>
            </div>
          </div>
          
          <!-- 表情选择 -->
          <div v-if="showEmoji" class="emoji-panel">
            <div class="emoji-list">
              <span 
                v-for="emoji in emojis" 
                :key="emoji"
                class="emoji-item"
                @click="addEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// 组件引入
const printer = () => import("./common/printer");
import axios from 'axios';

export default {
  components: {
    printer
  },

  data() {
    return {
      loading: true,
      error: null,
      surveyNotActive: false,
      submitting: false,
      printerInfo: "咦，这个地方是用来干什么的？",
      
      // 调查问卷数据
      surveyData: {},
      multipleChoiceQuestions: [],
      essayQuestions: [],
      isAnonymous: false,
      
      showEssayDialog: false,
      currentEssayQuestion: null,
      essayAnswer: "",
      showEmoji: false,
      isMobile: false,
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
    };
  },

  computed: {
    essayPlaceholder() {
      return this.currentEssayQuestion && this.currentEssayQuestion.placeholder 
        ? this.currentEssayQuestion.placeholder 
        : "请详细阐述您的观点...";
    },
    
    dialogWidth() {
      return this.isMobile ? '90%' : '60%';
    },
    
    // 创建 axios 实例
    api() {
      const constant = this.$constant || {}
      const mediaBaseURL = constant.webURL || window.location.origin

      const baseURL = mediaBaseURL || 'http://localhost:8000';
      
      // 获取认证 token
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      // 配置 headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // 添加认证头部
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      return axios.create({
        baseURL: baseURL,
        timeout: 60000,
        headers: headers
      });
    }
  },

  async created() {
    this.checkMobile();
    await this.loadLatestSurvey();
    this.getGuShi();
  },

  mounted() {
    window.addEventListener('resize', this.checkMobile);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },

  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    // 从服务器加载最新的活跃问卷
    async loadLatestSurvey() {
      try {
        this.loading = true;
        this.error = null;
        this.surveyNotActive = false;
        
        console.log('开始加载最新活跃问卷...');
        
        // 调用API获取最新活跃问卷
        const response = await this.api.get('/api/surveys/latest-active/');
        
        if (response.data.success) {
          this.surveyData = response.data.data;
          console.log('最新活跃问卷加载成功:', this.surveyData);
          
          // 初始化问题数据
          this.initializeQuestions();
          
          this.$notify({
            type: "success",
            title: "成功",
            message: "问卷加载成功",
            position: "top-left",
            offset: 50,
          });
        } else {
          if (response.data.error_code === 'NO_ACTIVE_SURVEY') {
            this.surveyNotActive = true;
            this.error = '当前没有活跃的问卷，请稍后再试';
          } else {
            throw new Error(response.data.error || '获取问卷配置失败');
          }
        }
        
      } catch (error) {
        console.error('加载最新问卷失败:', error);
        
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (errorData.error_code === 'NO_ACTIVE_SURVEY') {
            this.surveyNotActive = true;
            this.error = '当前没有活跃的问卷，请稍后再试';
          } else if (errorData.error_code === 'SURVEY_NOT_ACTIVE') {
            this.surveyNotActive = true;
            this.error = '该问卷未发布或已结束';
          } else {
            this.error = errorData.error || '加载问卷配置失败';
          }
        } else if (error.code === 'ECONNABORTED') {
          this.error = '请求超时，请检查网络连接';
        } else if (error.message === 'Network Error') {
          this.error = '网络错误，请检查服务器是否运行';
        } else {
          this.error = error.message || '加载问卷配置失败';
        }
        
        this.$notify({
          type: "error",
          title: "错误",
          message: this.error,
          position: "top-left",
          offset: 50,
        });
      } finally {
        this.loading = false;
      }
    },

    // 初始化问题数据
    initializeQuestions() {
      const questions = this.surveyData.questions || {};
      
      console.log('原始问题数据:', questions);
      console.log('选择题:', questions.multipleChoiceQuestions);
      console.log('论述题:', questions.essayQuestions);
      
      // 初始化选择题
      this.multipleChoiceQuestions = (questions.multipleChoiceQuestions || []).map(question => ({
        ...question,
        id: question.id || this.generateId(),
        answer: question.type === 'multiple' ? [] : '',
        error: ''
      }));
      
      // 初始化论述题
      this.essayQuestions = (questions.essayQuestions || []).map(question => ({
        ...question,
        id: question.id || this.generateId(),
        answer: '',
        answerPreview: '',
        error: ''
      }));
      
      console.log('初始化后选择题:', this.multipleChoiceQuestions);
      console.log('初始化后论述题:', this.essayQuestions);
    },
    
    // 生成唯一ID（备用）
    generateId() {
      return Date.now() + Math.random().toString(36).substr(2, 9);
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    

    async submitSurvey() {
      if (!this.validateAllQuestions()) {
        this.$notify({
          type: "warning",
          title: "提示",
          message: "请完成所有必填问题",
          position: "top-left",
          offset: 50,
        });
        return;
      }
      
      // 检查登录状态
      if (this.surveyData.settings?.require_login && this.$common.isEmpty(this.$store.state.currentUser)) {
        this.$notify({
          type: "error",
          title: "提示",
          message: "请先登录后再提交问卷",
          position: "top-left",
          offset: 50,
        });
        return;
      }
      
      try {
        this.submitting = true;
        
        // 构建答案数据
        const answers = {};
        
        // 收集选择题答案
        this.multipleChoiceQuestions.forEach(question => {
          if (question.answer) {
            answers[question.id] = question.answer;
          }
        });
        
        // 收集论述题答案
        this.essayQuestions.forEach(question => {
          if (question.answer) {
            answers[question.id] = question.answer;
          }
        });
        
        console.log("提交问卷答案:", answers);
        console.log("问卷ID:", this.surveyData.id);        
        const token_test = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        console.log("測試不登陸問卷token:", token_test);
        
        const response = await this.api.post(`/api/surveys/${this.surveyData.id}/submit/`, {
          answers: answers,
          is_anonymous: this.isAnonymous
        });
        
        if (response.data.success) {
          // 检查是否有AI评估结果和注册序列号
          const hasAiEvaluation = response.data.data?.ai_evaluation;
          const hasRegistrationCode = response.data.data?.registration_code;
          
          if (hasAiEvaluation) {
            // 显示评分弹窗，传递注册序列号
            this.showEvaluationResult(
              response.data.data.ai_evaluation, 
              hasRegistrationCode ? response.data.data.registration_code : null
            );
          } else {
            // 没有评估结果，显示普通成功消息
            this.$notify({
              type: "success",
              title: "成功",
              message: response.data.message || "问卷提交成功！",
              position: "top-left",
              offset: 50,
            });
            
            // 提交成功后重置表单
            setTimeout(() => {
              this.showSubmissionSuccess();
              this.resetForm();
            }, 1000);
          }
        } else {
          throw new Error(response.data.error || '提交失败');
        }
        
      } catch (error) {
        console.error('提交问卷失败:', error);
        
        let errorMessage = '提交失败，请重试';
        
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          if (status === 400) {
            errorMessage = errorData.error || '数据验证失败';
            
            // 处理重复提交的情况
            if (errorData.error && errorData.error.includes('已经提交过该问卷')) {
              errorMessage = errorData.error; // 使用服务器返回的具体时间信息
            }
          } else if (status === 401) {
            errorMessage = '认证失败，请重新登录';
          } else if (status === 403) {
            errorMessage = '没有权限提交此问卷';
          } else if (status === 404) {
            errorMessage = '问卷不存在或已被删除';
          } else if (status === 500) {
            errorMessage = '服务器内部错误，请稍后重试';
          }
        } else if (error.message === 'Network Error') {
          errorMessage = '网络错误，请检查连接后重试';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = '请求超时，请检查网络连接';
        }
        
        this.$notify({
          type: "error",
          title: "错误",
          message: errorMessage,
          position: "top-left",
          offset: 50,
        });
      } finally {
        this.submitting = false;
      }
    },

    // 显示评估结果弹窗
    showEvaluationResult(evaluationData, registrationCode = null) {
      const score = evaluationData.score;
      const comment = evaluationData.comment;
      
      // 根据评分确定颜色和等级
      let scoreColor = '#67C23A'; // 默认绿色
      let scoreLevel = '优秀';
      
      if (score >= 90) {
        scoreColor = '#67C23A'; // 绿色
        scoreLevel = '优秀';
      } else if (score >= 80) {
        scoreColor = '#E6A23C'; // 黄色
        scoreLevel = '良好';
      } else if (score >= 70) {
        scoreColor = '#E6A23C'; // 黄色
        scoreLevel = '中等';
      } else if (score >= 60) {
        scoreColor = '#F56C6C'; // 红色
        scoreLevel = '合格';
      } else {
        scoreColor = '#F56C6C'; // 红色
        scoreLevel = '需改进';
      }
      
      // 构建消息内容 - 添加可滚动区域
      let messageContent = `
        <div style="text-align: center;">
          <div style="font-size: ${this.isMobile ? '36px' : '48px'}; color: ${scoreColor}; margin-bottom: 10px;">
            ${score}分
          </div>
          <div style="font-size: ${this.isMobile ? '16px' : '18px'}; color: ${scoreColor}; margin-bottom: 20px;">
            ${scoreLevel}
          </div>
          
          <!-- 添加可滚动区域 -->
          <div style="
            max-height: 200px; 
            overflow-y: auto; 
            margin-bottom: 20px;
            padding-right: 10px;
            text-align: left;
          ">
            <div style="
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              border-left: 4px solid ${scoreColor};
            ">
              <div style="font-size: ${this.isMobile ? '13px' : '14px'}; color: #606266; line-height: 1.6; white-space: pre-wrap;">
                ${comment}
              </div>
            </div>
          </div>
          
          <!-- 添加滚动提示 -->
          <div v-if="${comment.length > 200}" style="font-size: 12px; color: #909399; margin-bottom: 10px;">
            <i class="el-icon-bottom" style="margin-right: 5px;"></i>
            可向下滑动查看更多内容
          </div>
      `;
      
      // 如果有注册序列号，显示序列号信息
      if (registrationCode) {
        messageContent += `
          <div style="margin-top: 10px; padding: 15px; background: #e8f4fd; border-radius: 8px; border: 1px solid #bee5eb;">
            <div style="font-size: ${this.isMobile ? '13px' : '14px'}; color: #0c5460; margin-bottom: 10px;">
              <strong>🎉 恭喜！您已获得注册资格</strong>
            </div>
            <div style="font-size: ${this.isMobile ? '11px' : '12px'}; color: #0c5460; margin-bottom: 10px;">
              您的注册序列号：
            </div>
            <div style="font-family: monospace; font-size: ${this.isMobile ? '14px' : '16px'}; font-weight: bold; color: #155724; background: white; padding: 10px; border-radius: 4px; border: 1px dashed #28a745; word-break: break-all;">
              ${registrationCode}
            </div>
            <div style="font-size: ${this.isMobile ? '10px' : '11px'}; color: #6c757d; margin-top: 10px;">
              请妥善保管此序列号，注册时需要用到
            </div>
          </div>
        `;
      }
      
      messageContent += `
          <div style="margin-top: 20px; font-size: 12px; color: #909399;">
            感谢您的参与！
          </div>
        </div>
      `;
      
      // 使用Element UI的MessageBox显示评分结果
      this.$msgbox({
        title: registrationCode ? '问卷评估结果 - 获得注册资格' : '问卷评估结果',
        message: messageContent,
        dangerouslyUseHTMLString: true,
        showCancelButton: false,
        confirmButtonText: '确定',
        customClass: 'evaluation-result-modal',
        beforeClose: (action, instance, done) => {
          // 关闭弹窗后重置表单
          this.showSubmissionSuccess();
          this.resetForm();
          done();
        }
      }).then(() => {
        // 确认按钮点击后的回调
        this.showSubmissionSuccess();
        this.resetForm();
      }).catch(() => {
        // 确保即使取消也重置表单
        this.showSubmissionSuccess();
        this.resetForm();
      });
    },

    openEssayDialog(question) {
      // 检查是否需要登录
      if (this.surveyData.settings?.require_login && this.$common.isEmpty(this.$store.state.currentUser)) {
        this.$notify({
          type: "error",
          title: "提示",
          message: "请先登录！",
          position: "top-left",
          offset: 50,
        });
        return;
      }
      
      this.currentEssayQuestion = question;
      this.essayAnswer = question.answer || '';
      this.showEssayDialog = true;
    },
    
    saveEssayAnswer() {
      if (this.essayAnswer.trim() === "") {
        this.$notify({
          type: "warning",
          title: "提示",
          message: "您还没有填写回答",
          position: "top-left",
          offset: 50,
        });
        return;
      }
      
      this.currentEssayQuestion.answer = this.essayAnswer;
      this.currentEssayQuestion.answerPreview = this.essayAnswer.length > 100 
        ? this.essayAnswer.substring(0, 100) + '...' 
        : this.essayAnswer;
      
      this.currentEssayQuestion.error = '';
      this.showEssayDialog = false;
      this.essayAnswer = '';
      this.showEmoji = false;
    },
    
    validateQuestion(question) {
      if (question.required) {
        if (question.type === 'single' && !question.answer) {
          question.error = '请选择至少一个选项';
          return false;
        } else if (question.type === 'multiple' && question.answer.length === 0) {
          question.error = '请选择至少一个选项';
          return false;
        } else if (question.type === 'essay' && !question.answer) {
          question.error = '请回答此问题';
          return false;
        }
      }
      
      question.error = '';
      return true;
    },
    
    validateAllQuestions() {
      let isValid = true;
      
      this.multipleChoiceQuestions.forEach(question => {
        if (!this.validateQuestion(question)) {
          isValid = false;
        }
      });
      
      this.essayQuestions.forEach(question => {
        if (!this.validateQuestion(question)) {
          isValid = false;
        }
      });
      
      return isValid;
    },
    
    showSubmissionSuccess() {
      this.$message({
        message: '感谢您的参与！问卷提交成功。',
        type: 'success',
        duration: 3000
      });
    },
    
    resetForm() {
      this.multipleChoiceQuestions.forEach(question => {
        question.answer = question.type === 'multiple' ? [] : '';
        question.error = '';
      });
      
      this.essayQuestions.forEach(question => {
        question.answer = '';
        question.answerPreview = '';
        question.error = '';
      });
      
      this.isAnonymous = false;
    },
    
    addEmoji(emoji) {
      this.essayAnswer += emoji;
    },
    
    openPicture() {
      this.$notify({
        type: "info",
        title: "提示",
        message: "图片上传功能暂未实现",
        position: "top-left",
        offset: 50,
      });
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
      const defaultPoems = [
        "春风又绿江南岸，明月何时照我还。",
        "人生若只如初见，何事秋风悲画扇。",
        "海上生明月，天涯共此时。",
        "会当凌绝顶，一览众山小。"
      ];
      const randomPoem = defaultPoems[Math.floor(Math.random() * defaultPoems.length)];
      this.printerInfo = randomPoem;
    }
  }
};
</script>

<style lang="scss" scoped>
/* 加载状态样式 */
.loading-container,
.error-container,
.inactive-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--gray15);
    border-top: 4px solid var(--orange2);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  .error-icon,
  .inactive-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  h3 {
    color: var(--darkBlue);
    margin-bottom: 10px;
    font-size: 18px;
  }
  
  p {
    color: var(--gray);
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.4;
  }
}

.retry-btn {
  padding: 10px 20px;
  background: var(--orange2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: var(--orange);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  font-size: clamp(24px, 6vw, 40px); // 响应式字体大小
  padding: 0 15px;
  text-align: center;
}

.printer {
  color: var(--darkBlue);
  background: var(--background);
  border-radius: 10px;
  padding: 0 10px;
  margin: 0 15px;
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

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/* 调查问卷容器向上移动 */
.survey-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.survey-header {
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    color: var(--darkBlue);
    margin-bottom: 12px;
    font-size: 20px;
    line-height: 1.3;
  }
  
  p {
    color: var(--gray);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
}

.question-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid var(--gray15);
  border-radius: 8px;
  background-color: var(--white);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.essay-question {
    background-color: var(--lightBg);
    border-left: 4px solid var(--orange2);
  }
}

.question-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.question-number {
  background-color: var(--orange2);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.question-text-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-text {
  font-weight: bold;
  color: var(--darkBlue);
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: 5px;
}

.required-mark {
  color: var(--red);
  font-size: 16px;
  align-self: flex-start;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
}

.option-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.option-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  width: 100%;
  padding: 8px 0;
}

.option-checkbox {
  display: inline-block;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: 2px solid var(--gray15);
  border-radius: 50%;
  margin-right: 12px;
  margin-top: 1px;
  position: relative;
  transition: all 0.3s ease;
}

input[type="radio"]:checked + label .option-checkbox {
  border-color: var(--orange2);
  background-color: var(--orange2);
}

input[type="radio"]:checked + label .option-checkbox::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

input[type="checkbox"]:checked + label .option-checkbox {
  border-color: var(--orange2);
  background-color: var(--orange2);
}

input[type="checkbox"]:checked + label .option-checkbox::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.option-text {
  color: var(--darkBlue);
  font-size: 14px;
  line-height: 1.4;
  flex: 1;
}

.answer-button-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--orange2), var(--orange));
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.answered {
    background: linear-gradient(135deg, var(--green1), var(--green2));
  }
}

.answer-preview {
  background-color: var(--white);
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid var(--green1);
  
  p {
    margin: 0;
    color: var(--darkBlue);
    font-size: 13px;
    line-height: 1.4;
  }
}

.error-message {
  color: var(--red);
  font-size: 12px;
  margin-top: 8px;
  padding: 6px 10px;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--red);
}

.survey-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.anonymous-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  
  .anonymous-checkbox {
    transform: scale(1.2);
  }
  
  .anonymous-label {
    color: var(--darkBlue);
    font-size: 14px;
    cursor: pointer;
  }
}

.submit-btn {
  padding: 14px 30px;
  background: linear-gradient(135deg, var(--blue2), var(--blue));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: var(--gray15);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.essay-dialog-content {
  padding: 10px;
}

.comment-textarea {
  border: 2px solid var(--gray15);
  width: 100%;
  font-size: 14px;
  padding: 15px;
  min-height: 150px;
  resize: vertical;
  outline: none;
  border-radius: 8px;
  background-color: var(--white);
  margin-bottom: 15px;
  line-height: 1.5;
  transition: border-color 0.3s ease;
  
  &:focus {
    border-color: var(--orange2);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
  
  &::placeholder {
    color: var(--gray);
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.char-count {
  color: var(--gray);
  font-size: 13px;
}

.tool-btn {
  padding: 6px 12px;
  background: var(--gray15);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  min-width: 44px; // 触摸友好的最小尺寸
  
  &:hover {
    background: var(--orange2);
    color: white;
  }
  
  &.active {
    background: var(--orange2);
    color: white;
  }
}

.save-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--green1), var(--green2));
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 80px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.emoji-panel {
  border: 1px solid var(--gray15);
  border-radius: 8px;
  padding: 10px;
  background: var(--white);
  max-height: 120px;
  overflow-y: auto;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.emoji-item {
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: 30px;
  text-align: center;
  
  &:hover {
    background: var(--orange2);
    transform: scale(1.2);
  }
  
  &:active {
    transform: scale(1.1);
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .signature-wall {
    height: 80vh;
  }
  
  .el-icon-arrow-down {
    font-size: 32px;
    bottom: 40px;
  }
  
  .survey-container {
    margin: 15px;
    padding: 15px;
  }
  
  .playful {
    font-size: 28px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-number {
    margin-bottom: 8px;
  }
  
  .question-text {
    font-size: 14px;
  }
  
  .options-container {
    gap: 8px;
  }
  
  .option-label {
    padding: 6px 0;
  }
  
  .option-checkbox {
    width: 18px;
    height: 18px;
    min-width: 18px;
    margin-right: 10px;
  }
  
  .option-text {
    font-size: 13px;
  }
  
  .answer-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .answer-preview p {
    font-size: 12px;
  }
  
  .submit-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .toolbar-left, .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .comment-textarea {
    min-height: 120px;
    font-size: 13px;
    padding: 12px;
  }
  
  .emoji-panel {
    max-height: 100px;
  }
  
  .emoji-item {
    font-size: 16px;
    min-width: 28px;
  }
}

@media screen and (max-width: 480px) {
  .signature-wall {
    height: 70vh;
  }
  
  .playful {
    font-size: 24px;
  }
  
  .printer h3 {
    font-size: 14px;
  }
  
  .el-icon-arrow-down {
    font-size: 28px;
    bottom: 30px;
  }
  
  .survey-container {
    margin: 10px;
    padding: 12px;
  }
  
  .survey-header h2 {
    font-size: 18px;
  }
  
  .survey-header p {
    font-size: 13px;
  }
  
  .question-item {
    padding: 12px;
  }
  
  .question-number {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  .answer-btn, .save-btn, .tool-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 防止移动端点击时出现蓝色背景 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 改善移动端滚动体验 */
html {
  -webkit-overflow-scrolling: touch;
}

body {
  overflow-x: hidden;
}

::v-deep .essay-dialog.mobile-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  
  .el-dialog__header {
    background: linear-gradient(135deg, var(--orange2), var(--orange));
    color: white;
    padding: 12px 15px;
    
    .el-dialog__title {
      color: white;
      font-size: 16px;
    }
    
    .el-dialog__headerbtn {
      top: 12px;
      right: 15px;
      
      .el-dialog__close {
        color: white;
        font-size: 18px;
        
        &:hover {
          color: var(--gray15);
        }
      }
    }
  }
  
  .el-dialog__body {
    padding: 15px;
  }
}

/* 评估结果弹窗样式 */
.evaluation-result-modal .el-message-box {
  width: 500px;
  max-width: 90vw;
  border-radius: 12px;
  overflow: hidden;
}

.evaluation-result-modal .el-message-box__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 20px;
}

.evaluation-result-modal .el-message-box__title {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.evaluation-result-modal .el-message-box__headerbtn {
  top: 15px;
}

.evaluation-result-modal .el-message-box__headerbtn .el-message-box__close {
  color: white;
}

.evaluation-result-modal .el-message-box__content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  font-size: 14px;
}

.evaluation-result-modal .el-message-box__btns {
  padding: 10px 20px 20px 20px;
  
  .el-button {
    padding: 10px 25px;
    font-size: 14px;
  }
}

/* 自定义滚动条样式 */
.evaluation-result-modal .el-message-box__content::-webkit-scrollbar {
  width: 6px;
}

.evaluation-result-modal .el-message-box__content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.evaluation-result-modal .el-message-box__content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.evaluation-result-modal .el-message-box__content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 移动端评估结果弹窗 */
@media screen and (max-width: 768px) {
  .evaluation-result-modal .el-message-box {
    width: 90vw;
    margin: 0 auto;
  }
  
  .evaluation-result-modal .el-message-box__header {
    padding: 12px 15px;
  }
  
  .evaluation-result-modal .el-message-box__title {
    font-size: 14px;
  }
  
  .evaluation-result-modal .el-message-box__content {
    padding: 15px;
    font-size: 13px;
  }
  
  .evaluation-result-modal .el-message-box__btns {
    padding: 8px 15px 15px 15px;
    
    .el-button {
      padding: 8px 20px;
      font-size: 13px;
    }
  }
}
</style>
