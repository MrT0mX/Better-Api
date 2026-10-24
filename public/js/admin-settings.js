(() => {
  const csrfToken = document.querySelector('input[name="_csrf"]')?.value;
  const theme = localStorage.getItem("site-theme") || "dark";
  document.body.dataset.theme = theme;
  let lastCredentialChecks = null;
  let lastCheckedAt = null;

  async function postJson(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
    return result;
  }

  function updateCredentialStatus(key, status, message) {
    const statusElement = document.querySelector(`[data-status-for="${key}"]`);
    const resultElement = document.querySelector(`[data-result-for="${key}"]`);
    if (!statusElement || !resultElement) return;
    statusElement.querySelector(".status-light").className = `status-light status-${status}`;
    statusElement.querySelector("span:last-child").textContent =
      status === "ok" ? "কাজ করছে" :
        status === "unknown" ? "নিজে যাচাই করুন" :
          status === "checking" ? "পরীক্ষা হচ্ছে…" :
            statusElement.dataset.configured === "true" ? "কাজ করছে না" : "দেওয়া হয়নি";
    resultElement.textContent = message;
    resultElement.dataset.status = status;
  }

  function updateOverview(status, message, checkedAt) {
    const overview = document.querySelector("#connection-overview");
    overview.dataset.status = status;
    document.querySelector("#connection-overview-light").className = `status-light status-${status}`;
    document.querySelector("#connection-summary").textContent = message;
    document.querySelector("#connection-checked-at").textContent = checkedAt
      ? `শেষ পরীক্ষা: ${new Date(checkedAt).toLocaleTimeString()}`
      : "";
  }

  async function refreshSystemHealth() {
    const databaseItem = document.querySelector('[data-health="database"]');
    const encryptionItem = document.querySelector('[data-health="encryption"]');
    try {
      const response = await fetch("/healthz", { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error(`Health check failed (${response.status}).`);
      const health = await response.json();
      const databaseOk = health.database === "connected";
      databaseItem.querySelector(".status-light").className =
        `status-light status-${databaseOk ? "ok" : "error"}`;
      databaseItem.querySelector("strong").textContent = databaseOk ? "Connected" : "Disconnected";
      return databaseOk;
    } catch (error) {
      databaseItem.querySelector(".status-light").className = "status-light status-error";
      databaseItem.querySelector("strong").textContent = "Unavailable";
      return false;
    } finally {
      const encryptionOk = document.querySelector("#connection-overview")
        .dataset.encryptionReady === "true";
      encryptionItem.querySelector(".status-light").className =
        `status-light status-${encryptionOk ? "ok" : "error"}`;
      encryptionItem.querySelector("strong").textContent =
        encryptionOk ? "Ready" : "Not configured";
      if (lastCredentialChecks) updateAggregateStatus();
    }
  }

  function updateAggregateStatus(checkedAt = lastCheckedAt) {
    const databaseOk = document.querySelector('[data-health="database"] strong').textContent === "Connected";
    const encryptionOk = document.querySelector("#connection-overview").dataset.encryptionReady === "true";
    const failed = lastCredentialChecks.filter((check) => check.status === "error").length;
    const succeeded = lastCredentialChecks.length - failed;
    const status = failed || !databaseOk || !encryptionOk
      ? "error"
      : lastCredentialChecks.length ? "ok" : "unknown";
    const summary = failed
      ? `${failed}টি connection check ব্যর্থ · ${succeeded}টি সচল`
      : !databaseOk
        ? "Database connection ব্যর্থ"
        : !encryptionOk
          ? "Secret encryption key configure করা নেই"
          : lastCredentialChecks.length
            ? `${succeeded}টি connection সচল`
            : "Server সচল · auto-test করার মতো credential configure করা নেই";
    updateOverview(status, summary, checkedAt);
  }

  async function runConnectionTests() {
    const button = document.querySelector("#run-connection-tests");
    const credentialButtons = [...document.querySelectorAll(".check-credential")]
      .filter((item) => document.querySelector(`[data-status-for="${item.dataset.key}"]`)
        ?.dataset.configured === "true");
    button.disabled = true;
    credentialButtons.forEach((item) => { item.disabled = true; });
    credentialButtons.forEach((item) => {
      updateCredentialStatus(item.dataset.key, "checking", "Connection test চলছে…");
    });
    updateOverview("unknown", "Configured connection test চলছে…");

    try {
      const result = await postJson("/admin/settings/check-all", {});
      const checkResults = new Map(result.checks.map((check) => [check.key, check]));
      credentialButtons.forEach((item) => {
        const check = checkResults.get(item.dataset.key);
        if (check) updateCredentialStatus(check.key, check.status, check.message);
      });

      document.querySelector("#connection-overview").dataset.encryptionReady =
        String(result.encryptionReady);
      lastCredentialChecks = result.checks;
      lastCheckedAt = result.checkedAt;
      await refreshSystemHealth();
      updateAggregateStatus(result.checkedAt);
    } catch (error) {
      await refreshSystemHealth();
      lastCredentialChecks = [{ status: "error" }];
      lastCheckedAt = new Date().toISOString();
      updateOverview("error", `Connection test ব্যর্থ: ${error.message}`);
      credentialButtons.forEach((item) => {
        updateCredentialStatus(item.dataset.key, "error", error.message);
      });
    } finally {
      button.disabled = false;
      credentialButtons.forEach((item) => { item.disabled = false; });
    }
  }

  document.querySelectorAll(".check-credential").forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.key;
      const resultElement = document.querySelector(`[data-result-for="${key}"]`);
      const statusElement = document.querySelector(`[data-status-for="${key}"]`);
      button.disabled = true;
      resultElement.textContent = "Connection test চলছে…";
      resultElement.dataset.status = "checking";
      statusElement.querySelector(".status-light").className = "status-light status-unknown";
      statusElement.querySelector("span:last-child").textContent = "পরীক্ষা হচ্ছে…";
      try {
        const result = await postJson("/admin/settings/check", { key });
        updateCredentialStatus(key, result.status, result.message);
        if (lastCredentialChecks) {
          lastCredentialChecks = lastCredentialChecks.map((check) =>
            check.key === key ? { ...check, ...result } : check
          );
          lastCheckedAt = new Date().toISOString();
          updateAggregateStatus();
        }
      } catch (error) {
        updateCredentialStatus(key, "error", error.message);
        if (lastCredentialChecks) {
          lastCredentialChecks = lastCredentialChecks.map((check) =>
            check.key === key ? { ...check, status: "error" } : check
          );
          lastCheckedAt = new Date().toISOString();
          updateAggregateStatus();
        }
      } finally {
        button.disabled = false;
      }
    });
  });

  document.querySelector("#run-connection-tests")
    .addEventListener("click", runConnectionTests);
  refreshSystemHealth();
  runConnectionTests();
  window.setInterval(refreshSystemHealth, 30000);

  document.querySelectorAll(".clear-credential").forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.key;
      if (!window.confirm("Database-এ সংরক্ষিত value মুছবেন? Host environment value থাকলে সেটি active থাকবে।")) return;
      button.disabled = true;
      const resultElement = document.querySelector(`[data-result-for="${key}"]`);
      try {
        await postJson("/admin/settings/clear", { key });
        window.location.reload();
      } catch (error) {
        resultElement.textContent = error.message;
        button.disabled = false;
      }
    });
  });

  const backupFile = document.querySelector("#settings-backup-file");
  const backupResult = document.querySelector("#backup-result");
  backupFile?.addEventListener("change", async () => {
    const file = backupFile.files?.[0];
    if (!file) return;
    backupResult.textContent = "Backup যাচাই ও restore হচ্ছে…";
    try {
      const backup = JSON.parse(await file.text());
      const result = await postJson("/admin/settings/restore", backup);
      backupResult.textContent = `${result.restored}টি encrypted setting restore হয়েছে।`;
      window.location.reload();
    } catch (error) {
      backupResult.textContent = error.message;
    } finally {
      backupFile.value = "";
    }
  });
})();
