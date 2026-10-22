(() => {
  const csrfToken = document.querySelector('input[name="_csrf"]')?.value;
  const theme = localStorage.getItem("site-theme") || "dark";
  document.body.dataset.theme = theme;

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

  document.querySelectorAll(".check-credential").forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.key;
      const resultElement = document.querySelector(`[data-result-for="${key}"]`);
      const statusElement = document.querySelector(`[data-status-for="${key}"]`);
      button.disabled = true;
      resultElement.textContent = "Connection test চলছে…";
      try {
        const result = await postJson("/admin/settings/check", { key });
        const light = statusElement.querySelector(".status-light");
        light.className = `status-light status-${result.status}`;
        statusElement.querySelector("span:last-child").textContent =
          result.status === "ok" ? "কাজ করছে" :
            result.status === "unknown" ? "নিজে যাচাই করুন" : "কাজ করছে না";
        resultElement.textContent = result.message;
      } catch (error) {
        const light = statusElement.querySelector(".status-light");
        light.className = "status-light status-error";
        statusElement.querySelector("span:last-child").textContent = "কাজ করছে না";
        resultElement.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  });

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
