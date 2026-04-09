function renderLoginPage(flash) {
  return renderAuthLayout({
    title: "登录系统",
    description: "",
    kicker: "登录",
    flash,
    linkbar: `
      <a class="text-link" href="#/register">开户注册</a>
      <a class="text-link" href="#/forgot-password">重置密码</a>
    `,
    formContent: `
      <form id="login-form" class="form-grid">
        <div class="form-row">
          <label for="loginName">账号 / 学号 / 工号</label>
          <input id="loginName" name="loginName" placeholder="请输入账号信息" autocomplete="username" />
        </div>
        <div class="form-row">
          <label for="password">密码</label>
          <input id="password" name="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </div>
        <div class="helper-links">
          <a class="text-link" href="#/forgot-password">忘记密码？</a>
        </div>
        <div class="form-actions">
          <button class="btn btn--primary" type="submit">登录</button>
        </div>
      </form>
    `,
    footerContent: `
      <div class="auth-footer-actions">
        <span>还没有账号？<a class="text-link" href="#/register">立即注册</a></span>
      </div>
    `,
  });
}

function renderRegisterPage(flash) {
  return renderAuthLayout({
    title: "开户注册",
    description: "填写基础信息完成注册。",
    kicker: "注册",
    flash,
    linkbar: `
      <a class="text-link" href="#/login">返回登录</a>
      <a class="text-link" href="#/forgot-password">重置密码</a>
    `,
    formContent: `
      <form id="register-form" class="form-grid">
        <div class="form-row--double">
          <div class="form-row">
            <label for="register-name">姓名</label>
            <input id="register-name" name="name" placeholder="请输入姓名" />
          </div>
          <div class="form-row">
            <label for="register-loginName">学号 / 登录名</label>
            <input id="register-loginName" name="loginName" placeholder="请输入学号或登录名" />
          </div>
        </div>
        <div class="form-row--double">
          <div class="form-row">
            <label for="register-email">邮箱</label>
            <input id="register-email" name="email" type="email" placeholder="请输入注册邮箱" />
          </div>
          <div class="form-row">
            <label for="register-phone">手机号</label>
            <input id="register-phone" name="phone" placeholder="请输入手机号" />
          </div>
        </div>
        <div class="form-row--double">
          <div class="form-row">
            <label for="register-classId">班级</label>
            <input id="register-classId" name="classId" placeholder="请输入所在班级" />
          </div>
          <div class="form-row">
            <label for="register-password">密码</label>
            <input id="register-password" name="password" type="password" placeholder="至少 8 位，包含字母和数字" />
          </div>
        </div>
        <div class="form-row">
          <label for="register-confirmPassword">确认密码</label>
          <input id="register-confirmPassword" name="confirmPassword" type="password" placeholder="再次输入密码" />
          <div class="hint-text">密码需至少 8 位，并同时包含字母和数字。</div>
        </div>
        <div class="form-actions">
          <button class="btn btn--primary" type="submit">提交注册</button>
          <a class="btn btn--secondary" href="#/login">取消</a>
        </div>
      </form>
    `,
    footerContent: `
      <div class="auth-footer-actions">
        <span>注册完成后即可登录。</span>
      </div>
    `,
  });
}

function renderForgotPasswordPage(flash) {
  return renderAuthLayout({
    title: "重置密码",
    description: "通过邮箱或登录名重置密码。",
    kicker: "密码重置",
    flash,
    linkbar: `
      <a class="text-link" href="#/login">返回登录</a>
      <a class="text-link" href="#/register">开户注册</a>
    `,
    formContent: `
      <form id="forgot-password-form" class="form-grid">
        <div class="form-row">
          <label for="forgot-identity">邮箱或登录名</label>
          <input id="forgot-identity" name="identity" placeholder="请输入邮箱或登录名" />
        </div>
        <div class="form-actions">
          <button class="btn btn--primary" type="submit">发送指引</button>
          <a class="btn btn--secondary" href="#/login">返回登录</a>
        </div>
      </form>
    `,
    footerContent: `
      <div class="auth-footer-actions">
        <span>如需帮助，请联系平台管理人员。</span>
      </div>
    `,
  });
}
