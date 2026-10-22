(() => {
  const csrf = document.querySelector("#admin-csrf")?.value;
  const message = document.querySelector("#security-message");

  async function post(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "CSRF-Token": csrf },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
    return result;
  }

  document.querySelector("#start-mfa")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const result = await post("/admin/security/mfa/setup", {
        password: document.querySelector("#setup-password").value,
      });
      document.querySelector("#mfa-secret").textContent = result.secret;
      document.querySelector("#mfa-uri").textContent = result.uri;
      document.querySelector("#enrollment").hidden = false;
      message.textContent = `Setup key ${result.expiresInMinutes} মিনিট কার্যকর থাকবে।`;
      message.className = "notice notice-success";
    } catch (error) {
      message.textContent = error.message;
      message.className = "notice notice-danger";
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector("#confirm-mfa")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const result = await post("/admin/security/mfa/confirm", {
        code: document.querySelector("#confirm-code").value,
      });
      document.querySelector("#recovery-list").textContent = result.recoveryCodes.join("\n");
      document.querySelector("#recovery-codes").hidden = false;
      document.querySelector("#enrollment").hidden = true;
      document.querySelector("#start-mfa").hidden = true;
      document.querySelector("#setup-password").hidden = true;
      message.textContent = "MFA চালু হয়েছে। Recovery code নিরাপদে সংরক্ষণ করুন, তারপর logout করে আবার login করুন।";
      message.className = "notice notice-success";
    } catch (error) {
      message.textContent = error.message;
      message.className = "notice notice-danger";
      button.disabled = false;
    }
  });

  document.querySelector("#disable-mfa")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!window.confirm("Admin MFA বন্ধ করবেন?")) return;
    button.disabled = true;
    try {
      await post("/admin/security/mfa/disable", {
        password: document.querySelector("#disable-password").value,
        code: document.querySelector("#disable-code").value,
      });
      message.textContent = "MFA বন্ধ হয়েছে; redirect হচ্ছে…";
      message.className = "notice notice-success";
      window.location.assign("/logout");
    } catch (error) {
      message.textContent = error.message;
      message.className = "notice notice-danger";
      button.disabled = false;
    }
  });
})();
