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

        <!--
        <div class="survey-meta">
          <span class="meta-item">创建者: {{ surveyData.created_by?.username || '系统' }}</span>
          <span class="meta-item">已收集: {{ surveyData.response_count }} 份回答</span>
          <span v-if="surveyData.end_date" class="meta-item">
            截止时间: {{ formatDate(surveyData.end_date) }}
          </span>
        </div>
        -->

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
            <span class="question-text">{{ question.text }}</span>
            <span v-if="question.required" class="required-mark">*</span>
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
              >
              <label :for="'q' + question.id + '-opt' + optIndex">{{ option.text }}</label>
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
            <span class="question-text">{{ question.text }}</span>
            <span v-if="question.required" class="required-mark">*</span>
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
          >
          <label for="anonymous-submit">匿名提交</label>
        </div>
        <button class="submit-btn" @click="submitSurvey" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交问卷' }}
        </button>
      </div>

      <!-- 论述题弹窗 -->
      <el-dialog
        :title="currentEssayQuestion ? '回答: ' + currentEssayQuestion.text : ''"
        :visible.sync="showEssayDialog"
        width="60%"
        :append-to-body="true"
        destroy-on-close
        center
        custom-class="essay-dialog"
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
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
    };
  },

  computed: {
    essayPlaceholder() {
      return this.currentEssayQuestion && this.currentEssayQuestion.placeholder 
        ? this.currentEssayQuestion.placeholder 
        : "请详细阐述您的观点...";
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
    await this.loadLatestSurvey();
    this.getGuShi();
  },

  methods: {

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
      
      // 构建消息内容
      let messageContent = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; color: ${scoreColor}; margin-bottom: 10px;">
            ${score}分
          </div>
          <div style="font-size: 18px; color: ${scoreColor}; margin-bottom: 20px;">
            ${scoreLevel}
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid ${scoreColor};">
            <div style="font-size: 14px; color: #606266; line-height: 1.6; text-align: left;">
              ${comment}
            </div>
          </div>
      `;
      
      // 如果有注册序列号，显示序列号信息
      if (registrationCode) {
        messageContent += `
          <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px; border: 1px solid #bee5eb;">
            <div style="font-size: 14px; color: #0c5460; margin-bottom: 10px;">
              <strong>🎉 恭喜！您已获得注册资格</strong>
            </div>
            <div style="font-size: 12px; color: #0c5460; margin-bottom: 10px;">
              您的注册序列号：
            </div>
            <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #155724; background: white; padding: 10px; border-radius: 4px; border: 1px dashed #28a745;">
              ${registrationCode}
            </div>
            <div style="font-size: 11px; color: #6c757d; margin-top: 10px;">
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























    // 其他方法保持不变...
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
  }
  
  p {
    color: var(--gray);
    font-size: 16px;
    margin-bottom: 20px;
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
  margin: 40px auto 40px auto;
  padding: 30px;
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
  margin-bottom: 40px;
  
  h2 {
    color: var(--darkBlue);
    margin-bottom: 15px;
    font-size: 28px;
  }
  
  p {
    color: var(--gray);
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.survey-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: var(--gray);
  
  .meta-item {
    background: var(--lightBg);
    padding: 5px 12px;
    border-radius: 15px;
  }
}

.question-item {
  margin-bottom: 30px;
  padding: 20px;
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
  margin-bottom: 20px;
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

.question-text {
  font-weight: bold;
  color: var(--darkBlue);
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.5;
}

.required-mark {
  color: var(--red);
  margin-left: 5px;
  font-size: 18px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  
  input {
    margin-right: 12px;
    transform: scale(1.2);
  }
  
  label {
    cursor: pointer;
    color: var(--darkBlue);
    font-size: 15px;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--orange2);
    }
  }
}

.answer-button-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.answer-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--orange2), var(--orange));
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  &.answered {
    background: linear-gradient(135deg, var(--green1), var(--green2));
  }
}

.answer-preview {
  background-color: var(--white);
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid var(--green1);
  
  p {
    margin: 0;
    color: var(--darkBlue);
    font-size: 14px;
    line-height: 1.5;
  }
}

.error-message {
  color: var(--red);
  font-size: 13px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--red);
}

.survey-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.anonymous-option {
  display: flex;
  align-items: center;
  gap: 8px;
  
  input {
    transform: scale(1.2);
  }
  
  label {
    color: var(--darkBlue);
    font-size: 14px;
    cursor: pointer;
  }
}

.submit-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, var(--blue2), var(--blue));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
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
  font-size: 15px;
  padding: 20px;
  min-height: 200px;
  resize: vertical;
  outline: none;
  border-radius: 8px;
  background-color: var(--white);
  margin-bottom: 20px;
  line-height: 1.6;
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
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.char-count {
  color: var(--gray);
  font-size: 14px;
}

.tool-btn {
  padding: 8px 16px;
  background: var(--gray15);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  
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
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--green1), var(--green2));
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
}

.emoji-panel {
  border: 1px solid var(--gray15);
  border-radius: 8px;
  padding: 15px;
  background: var(--white);
  max-height: 150px;
  overflow-y: auto;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji-item {
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--orange2);
    transform: scale(1.2);
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .survey-container {
    margin: 20px;
    padding: 20px;
  }
  
  .playful {
    font-size: 30px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-number {
    margin-bottom: 10px;
  }
  
  .survey-meta {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 15px;
  }
  
  .toolbar-left, .toolbar-right {
    width: 100%;
    justify-content: center;
  }
}

::v-deep .essay-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  
  .el-dialog__header {
    background: linear-gradient(135deg, var(--orange2), var(--orange));
    color: white;
    
    .el-dialog__title {
      color: white;
    }
    
    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        
        &:hover {
          color: var(--gray15);
        }
      }
    }
  }
}







/* 评估结果弹窗样式 */
.evaluation-result-modal .el-message-box {
  width: 450px;
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
  padding: 30px 20px;
}








</style>
