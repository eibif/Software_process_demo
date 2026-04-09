function handleSubmit(event) {
  const { target } = event;

  if (!(target instanceof HTMLFormElement)) {
    return;
  }

  if (target.id === "login-form") {
    event.preventDefault();
    handleLoginSubmit(target);
    return;
  }

  if (target.id === "register-form") {
    event.preventDefault();
    handleRegisterSubmit(target);
    return;
  }

  if (target.id === "forgot-password-form") {
    event.preventDefault();
    handleForgotPasswordSubmit(target);
    return;
  }

  if (target.id === "user-filters-form") {
    event.preventDefault();
    const formData = new FormData(target);
    appState.userFilters = {
      query: String(formData.get("query") || ""),
      role: String(formData.get("role") || "all"),
      status: String(formData.get("status") || "all"),
    };
    renderApp();
    return;
  }

  if (target.id === "user-form") {
    event.preventDefault();
    handleUserFormSubmit(target);
    return;
  }

  if (target.id === "profile-form") {
    event.preventDefault();
    handleProfileSubmit(target);
  }
}

function handleChange(event) {
  const { target } = event;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.id === "role-switcher") {
    handleRoleSwitch(target.value);
  }
}

function handleClick(event) {
  const target = event.target instanceof HTMLElement ? event.target.closest("[data-action]") : null;

  if (!target) {
    return;
  }

  const action = target.dataset.action;

  if (action === "logout") {
    handleLogout();
    return;
  }

  if (action === "toggle-user-status") {
    handleToggleUserStatus(target.dataset.userId, target.dataset.nextStatus);
    return;
  }

  if (action === "reset-password") {
    handleResetPassword(target.dataset.userId);
    return;
  }

  if (action === "reset-filters") {
    appState.userFilters = { query: "", role: "all", status: "all" };
    renderApp();
  }
}

function handleLoginSubmit(form) {
  const formData = new FormData(form);
  const loginName = String(formData.get("loginName") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!loginName || !password) {
    showToast("请输入账号和密码。", "warning");
    return;
  }

  const users = getUsers();
  const user = users.find((item) => item.loginName === loginName || item.email === loginName);

  if (!user) {
    showToast("账号不存在，请检查输入信息。", "danger");
    return;
  }

  if (user.status === "locked") {
    showToast("该账号当前已锁定，请联系管理人员处理。", "warning");
    return;
  }

  if (user.status === "disabled") {
    showToast("该账号当前不可用，请联系管理人员处理。", "warning");
    return;
  }

  if (user.password !== password) {
    showToast("密码错误，请重新输入。", "danger");
    return;
  }

  const sessionId = createId("sess");
  const currentRole = user.primaryRole || user.roles[0];
  const loginAt = new Date().toISOString();
  const session = {
    sessionId,
    userId: user.id,
    loginAt,
    expiresAt: "",
    deviceLabel: instanceId,
    currentRole,
    status: "active",
  };

  const activeSessions = getActiveSessions();
  activeSessions[user.id] = {
    sessionId,
    loginAt,
    currentRole,
    instanceId,
  };
  saveActiveSessions(activeSessions);
  setCurrentSession(session);
  appState.userFilters = { query: "", role: "all", status: "all" };

  const updatedUsers = users.map((item) =>
    item.id === user.id
      ? {
          ...item,
          lastLoginAt: loginAt,
          updatedAt: loginAt,
        }
      : item
  );

  saveUsers(updatedUsers);
  appendAuditLog({
    userId: user.id,
    action: "login",
    targetId: user.id,
    detail: `${user.name} 登录系统。`,
  });

  showToast(`欢迎回来，${user.name}。`, "success");
  navigate("/dashboard");
}

function handleRegisterSubmit(form) {
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const loginName = String(formData.get("loginName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const classId = String(formData.get("classId") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const confirmPassword = String(formData.get("confirmPassword") || "").trim();

  if (!name || !loginName || !email || !classId || !password || !confirmPassword) {
    showToast("请完整填写注册信息。", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showToast("两次输入的密码不一致。", "warning");
    return;
  }

  if (!passwordIsValid(password)) {
    showToast("密码需至少 8 位，且同时包含字母和数字。", "warning");
    return;
  }

  const users = getUsers();

  if (users.some((user) => user.loginName === loginName)) {
    showToast("登录名已存在，请更换。", "danger");
    return;
  }

  if (users.some((user) => user.email === email)) {
    showToast("邮箱已被使用，请更换。", "danger");
    return;
  }

  const now = new Date().toISOString();
  const nextUsers = [
    {
      id: createId("user"),
      loginName,
      password,
      name,
      roles: ["Student"],
      primaryRole: "Student",
      email,
      phone,
      classId,
      department: "计算机学院",
      advisorId: "",
      status: "active",
      lastLoginAt: "",
      createdAt: now,
      updatedAt: now,
    },
    ...users,
  ];

  saveUsers(nextUsers);
  appendAuditLog({
    userId: "guest",
    action: "register",
    targetId: loginName,
    detail: `${name} 完成了账号注册。`,
  });

  setFlash("注册成功，请使用新账号登录。", "success");
  navigate("/login");
}

function handleForgotPasswordSubmit(form) {
  const formData = new FormData(form);
  const identity = String(formData.get("identity") || "").trim();

  if (!identity) {
    showToast("请输入邮箱或登录名。", "warning");
    return;
  }

  const user = getUsers().find((item) => item.loginName === identity || item.email === identity);

  if (!user) {
    showToast("未找到匹配账号，请检查输入。", "danger");
    return;
  }

  setFlash(`密码重置指引已发送至 ${user.email}。`, "success");
  navigate("/login");
}

function handleUserFormSubmit(form) {
  const editingId = form.dataset.userId || "";
  const formData = new FormData(form);
  const users = getUsers();
  const currentSession = getCurrentSession();
  const currentUser = getCurrentUserFromSession(currentSession, users);

  if (!currentSession || !currentUser) {
    setFlash("登录状态已失效，请重新登录。", "warning");
    navigate("/login");
    return;
  }

  const currentRole = currentSession.currentRole;
  const editingTarget = editingId ? users.find((user) => user.id === editingId) ?? null : null;

  if (editingId && !editingTarget) {
    showToast("目标用户不存在。", "danger");
    navigate("/users");
    return;
  }

  if (editingTarget && !canManageUserByScope(currentRole, currentUser, editingTarget)) {
    showToast("当前角色不能修改该用户。", "warning");
    navigate("/users");
    return;
  }

  let payload = {
    name: String(formData.get("name") || "").trim(),
    loginName: String(formData.get("loginName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    classId: String(formData.get("classId") || "").trim(),
    department: String(formData.get("department") || "").trim(),
    advisorId: String(formData.get("advisorId") || "").trim(),
    primaryRole: String(formData.get("primaryRole") || "").trim(),
    status: String(formData.get("status") || "active").trim(),
    password: String(formData.get("password") || "").trim(),
    roles: Array.from(form.querySelectorAll('input[name="roles"]:checked')).map((item) => item.value),
  };

  if (currentRole === "Teacher") {
    payload = {
      ...payload,
      roles: ["Student"],
      primaryRole: "Student",
      status: editingTarget?.status || "active",
      advisorId: currentUser.id,
    };
  }

  if (!payload.name || !payload.loginName || !payload.email) {
    showToast("姓名、登录名和邮箱为必填项。", "warning");
    return;
  }

  if (!payload.roles.length) {
    showToast("请至少选择一个角色。", "warning");
    return;
  }

  if (!payload.roles.includes(payload.primaryRole)) {
    showToast("默认角色必须属于已勾选角色。", "warning");
    return;
  }

  if (payload.roles.includes("Student") && !payload.classId) {
    showToast("学生角色建议填写班级信息。", "warning");
    return;
  }

  if ((payload.roles.includes("Teacher") || payload.roles.includes("Admin")) && !payload.department) {
    showToast("教师或管理员角色建议填写部门信息。", "warning");
    return;
  }

  if (!payload.roles.includes("Student")) {
    payload.advisorId = "";
  }

  const duplicateLogin = users.find((user) => user.loginName === payload.loginName && user.id !== editingId);
  if (duplicateLogin) {
    showToast("登录名已存在，请更换。", "danger");
    return;
  }

  const duplicateEmail = users.find((user) => user.email === payload.email && user.id !== editingId);
  if (duplicateEmail) {
    showToast("邮箱已存在，请更换。", "danger");
    return;
  }

  if (!editingId && !payload.password) {
    showToast("新建用户必须设置初始密码。", "warning");
    return;
  }

  if (payload.password && !passwordIsValid(payload.password)) {
    showToast("密码需至少 8 位，且同时包含字母和数字。", "warning");
    return;
  }

  const now = new Date().toISOString();
  let nextUsers;
  let savedUser;

  if (editingId) {
    nextUsers = users.map((user) => {
      if (user.id !== editingId) {
        return user;
      }

      savedUser = {
        ...user,
        ...payload,
        password: payload.password || user.password,
        updatedAt: now,
      };

      return savedUser;
    });
  } else {
    savedUser = {
      id: createId("user"),
      ...payload,
      lastLoginAt: "",
      createdAt: now,
      updatedAt: now,
    };
    nextUsers = [savedUser, ...users];
  }

  saveUsers(nextUsers);

  appendAuditLog({
    userId: currentSession.userId,
    action: editingId ? "update:user" : "create:user",
    targetId: savedUser.id,
    detail: `${roleLabels[currentRole]}${editingId ? "更新" : "创建"}了用户 ${savedUser.name}。`,
  });

  syncCurrentUserAfterMutation(savedUser);

  showToast(editingId ? "用户资料已更新。" : "新用户已创建。", "success");
  navigate(editingId ? `/users/${savedUser.id}` : "/users");
}

function handleProfileSubmit(form) {
  const currentSession = getCurrentSession();
  const users = getUsers();
  const formData = new FormData(form);

  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    classId: String(formData.get("classId") || "").trim(),
    department: String(formData.get("department") || "").trim(),
  };

  if (!payload.name || !payload.email) {
    showToast("姓名和邮箱不能为空。", "warning");
    return;
  }

  if (users.some((user) => user.email === payload.email && user.id !== currentSession.userId)) {
    showToast("邮箱已被其他账号使用。", "danger");
    return;
  }

  let updatedUser = null;
  const now = new Date().toISOString();

  const nextUsers = users.map((user) => {
    if (user.id !== currentSession.userId) {
      return user;
    }

    updatedUser = {
      ...user,
      ...payload,
      updatedAt: now,
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  syncCurrentUserAfterMutation(updatedUser);
  appendAuditLog({
    userId: currentSession.userId,
    action: "update:profile",
    targetId: currentSession.userId,
    detail: `${updatedUser.name} 更新了个人资料。`,
  });

  showToast("个人资料已保存。", "success");
  renderApp();
}

function syncCurrentUserAfterMutation(updatedUser) {
  const currentSession = getCurrentSession();

  if (!currentSession || !updatedUser || currentSession.userId !== updatedUser.id) {
    return;
  }

  if (updatedUser.status !== "active") {
    setFlash("当前账号状态发生变化，请重新登录。", "warning");
    clearCurrentSession({ removeRegistry: true });
    navigate("/login");
    return;
  }

  if (!updatedUser.roles.includes(currentSession.currentRole)) {
    currentSession.currentRole = updatedUser.primaryRole || updatedUser.roles[0];
  }

  setCurrentSession(currentSession);

  const activeSessions = getActiveSessions();
  if (activeSessions[updatedUser.id] && activeSessions[updatedUser.id].sessionId === currentSession.sessionId) {
    activeSessions[updatedUser.id].currentRole = currentSession.currentRole;
    saveActiveSessions(activeSessions);
  }
}

function handleToggleUserStatus(userId, nextStatus) {
  const currentSession = getCurrentSession();
  const users = getUsers();
  const currentUser = getCurrentUserFromSession(currentSession, users);

  if (!currentSession || !currentUser || !userId || !nextStatus) {
    return;
  }

  const target = users.find((user) => user.id === userId);

  if (!target) {
    showToast("目标用户不存在。", "danger");
    return;
  }

  if (!canManageUserByScope(currentSession.currentRole, currentUser, target)) {
    showToast("当前角色不能修改该用户状态。", "warning");
    return;
  }

  if (target.id === currentSession.userId && nextStatus !== "active") {
    showToast("当前登录账号不能直接在列表中冻结。", "warning");
    return;
  }

  const now = new Date().toISOString();
  const nextUsers = users.map((user) =>
    user.id === userId
      ? {
          ...user,
          status: nextStatus,
          updatedAt: now,
        }
      : user
  );
  saveUsers(nextUsers);

  appendAuditLog({
    userId: currentSession.userId,
    action: nextStatus === "active" ? "unfreeze:user" : "freeze:user",
    targetId: userId,
    detail: `${currentUser.name} 将 ${target.name} 的状态改为 ${statusLabels[nextStatus]}。`,
  });

  showToast(`账号状态已更新为${statusLabels[nextStatus]}。`, "success");
  renderApp();
}

function handleResetPassword(userId) {
  const currentSession = getCurrentSession();
  const users = getUsers();
  const currentUser = getCurrentUserFromSession(currentSession, users);

  if (!currentSession || !currentUser) {
    return;
  }

  const target = users.find((user) => user.id === userId);

  if (!target) {
    showToast("目标用户不存在。", "danger");
    return;
  }

  if (!canManageUserByScope(currentSession.currentRole, currentUser, target)) {
    showToast("当前角色不能重置该用户密码。", "warning");
    return;
  }

  const nextUsers = users.map((user) =>
    user.id === userId
      ? {
          ...user,
          password: "Demo12345",
          updatedAt: new Date().toISOString(),
        }
      : user
  );

  saveUsers(nextUsers);
  appendAuditLog({
    userId: currentSession.userId,
    action: "reset:password",
    targetId: userId,
    detail: `${currentUser.name} 重置了 ${target.name} 的密码。`,
  });

  showToast("密码已重置。", "success");
}

function handleRoleSwitch(nextRole) {
  const session = getCurrentSession();
  const user = getCurrentUserFromSession(session, getUsers());

  if (!session || !user || !user.roles.includes(nextRole)) {
    showToast("无法切换到目标角色。", "warning");
    renderApp();
    return;
  }

  session.currentRole = nextRole;
  setCurrentSession(session);

  const activeSessions = getActiveSessions();
  if (activeSessions[user.id] && activeSessions[user.id].sessionId === session.sessionId) {
    activeSessions[user.id].currentRole = nextRole;
    saveActiveSessions(activeSessions);
  }

  appendAuditLog({
    userId: user.id,
    action: "switch:role",
    targetId: user.id,
    detail: `${user.name} 切换到了 ${roleLabels[nextRole]} 视图。`,
  });

  showToast(`已切换到${roleLabels[nextRole]}视图。`, "success");

  if (nextRole === "Student" && getHashPath().startsWith("/users")) {
    navigate("/dashboard");
    return;
  }

  renderApp();
}

function handleLogout() {
  const session = getCurrentSession();

  if (!session) {
    navigate("/login");
    return;
  }

  appendAuditLog({
    userId: session.userId,
    action: "logout",
    targetId: session.userId,
    detail: "用户退出了系统。",
  });

  clearCurrentSession({ removeRegistry: true });
  appState.userFilters = { query: "", role: "all", status: "all" };
  setFlash("你已安全退出登录。", "success");
  navigate("/login");
}

function simulateRemoteLogin() {
  const session = getCurrentSession();

  if (!session) {
    return;
  }

  const activeSessions = getActiveSessions();
  activeSessions[session.userId] = {
    sessionId: createId("remote"),
    loginAt: new Date().toISOString(),
    currentRole: session.currentRole,
    instanceId: "remote-demo",
  };
  saveActiveSessions(activeSessions);
  validateReplacedSession();
}

function validateReplacedSession() {
  const session = getCurrentSession();

  if (!session) {
    return;
  }

  const activeSessions = getActiveSessions();
  const activeSession = activeSessions[session.userId];

  if (!activeSession || activeSession.sessionId !== session.sessionId) {
    setFlash("账号已在其他位置登录，请重新认证。", "warning");
    clearCurrentSession({ removeRegistry: false });
    navigate("/login");
  }
}

function handleStorageSync(event) {
  if (event.key !== STORAGE_KEYS.activeSessions && event.key !== STORAGE_KEYS.users) {
    return;
  }

  const session = getCurrentSession();

  if (!session) {
    return;
  }

  if (event.key === STORAGE_KEYS.activeSessions) {
    validateReplacedSession();
    return;
  }

  if (event.key === STORAGE_KEYS.users) {
    const users = getUsers();
    const currentUser = users.find((user) => user.id === session.userId);

    if (!currentUser) {
      setFlash("当前账号已被移除，请重新登录。", "warning");
      clearCurrentSession({ removeRegistry: false });
      navigate("/login");
      return;
    }

    if (currentUser.status !== "active") {
      setFlash("当前账号状态已变化，请重新登录。", "warning");
      clearCurrentSession({ removeRegistry: false });
      navigate("/login");
      return;
    }

    if (!currentUser.roles.includes(session.currentRole)) {
      session.currentRole = currentUser.primaryRole || currentUser.roles[0];
      setCurrentSession(session);
      renderApp();
    }
  }
}

function resetLocalData() {
  localStorage.removeItem(STORAGE_KEYS.users);
  localStorage.removeItem(STORAGE_KEYS.auditLogs);
  localStorage.removeItem(STORAGE_KEYS.activeSessions);
  sessionStorage.removeItem(SESSION_KEYS.currentSession);
  appState.userFilters = { query: "", role: "all", status: "all" };
  seedDemoData();
  setFlash("系统数据已恢复到初始状态。", "success");
  navigate("/login");
}

