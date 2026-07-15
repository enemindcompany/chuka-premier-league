/* ==========================================================
   auth.js — Google Identity Services sign-in for players.
   No password system: the ID token itself (verified server-side by
   the Apps Script endpoint) is what proves who a player is.
   ========================================================== */

function cplDecodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function cplSaveSession(idToken) {
  const payload = cplDecodeJwt(idToken);
  sessionStorage.setItem('cpl_id_token', idToken);
  sessionStorage.setItem('cpl_email', payload && payload.email ? payload.email : '');
  sessionStorage.setItem('cpl_name', payload && payload.name ? payload.name : '');
}

function cplGetSession() {
  return {
    idToken: sessionStorage.getItem('cpl_id_token') || '',
    email: sessionStorage.getItem('cpl_email') || '',
    name: sessionStorage.getItem('cpl_name') || ''
  };
}

function cplLogout() {
  sessionStorage.removeItem('cpl_id_token');
  sessionStorage.removeItem('cpl_email');
  sessionStorage.removeItem('cpl_name');
  window.location.href = 'index.html';
}

function cplHandleCredentialResponse(response) {
  cplSaveSession(response.credential);
  const redirect = cplQs('redirect');
  window.location.href = redirect || 'players.html';
}

/** Call after the Google Identity Services <script> tag has loaded. */
function initGoogleSignIn(containerId) {
  const container = document.getElementById(containerId);
  const session = cplGetSession();

  if (session.idToken) {
    container.innerHTML = `
      <p>Signed in as <strong>${cplEscape(session.name || session.email)}</strong> (${cplEscape(session.email)}).</p>
      <button class="btn secondary" id="cpl-logout-btn">Sign out</button>`;
    document.getElementById('cpl-logout-btn').addEventListener('click', cplLogout);
    return;
  }

  if (typeof google === 'undefined' || !google.accounts) {
    container.innerHTML = '<p class="empty">Google Sign-In script did not load — check your connection.</p>';
    return;
  }

  google.accounts.id.initialize({
    client_id: CPL_CONFIG.GOOGLE_CLIENT_ID,
    callback: cplHandleCredentialResponse
  });
  google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', text: 'signin_with' });
}
