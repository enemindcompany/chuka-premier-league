/* ==========================================================
   registrations.js — public sign-up forms for players, teams, and
   referees. Every submission lands as "Pending" in the Sheet; nothing
   here activates a player, publishes a team, or lists a referee on
   its own — the admin reviews and flips the Status cell manually.
   ========================================================== */

function initPlayerRegistration() {
  const form = document.getElementById('player-reg-form');
  const msg = document.getElementById('player-reg-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const payload = {
      action: 'registerPlayer',
      name: form.name.value.trim(),
      team: form.team.value.trim(),
      email: form.email.value.trim(),
      position: form.position.value,
      paymentRef: form.paymentRef.value.trim()
    };

    try {
      const result = await CPL.post(payload);
      if (result.ok) {
        cplShowMsg(msg, 'Registration received — the admin will confirm your payment and activate your CPL number shortly.', 'ok');
        form.reset();
      } else {
        cplShowMsg(msg, result.error || 'Something went wrong. Please try again.', 'err');
      }
    } catch (err) {
      cplShowMsg(msg, 'Network error — please try again.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });
}

function initTeamRegistration() {
  const form = document.getElementById('team-reg-form');
  const msg = document.getElementById('team-reg-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const payload = {
      action: 'registerTeam',
      teamName: form.teamName.value.trim(),
      league: form.league.value,
      contactName: form.contactName.value.trim(),
      contactEmail: form.contactEmail.value.trim(),
      paymentRef: form.paymentRef.value.trim()
    };

    try {
      const result = await CPL.post(payload);
      if (result.ok) {
        cplShowMsg(msg, 'Registration received — the admin will confirm payment and add your team to the league.', 'ok');
        form.reset();
      } else {
        cplShowMsg(msg, result.error || 'Something went wrong. Please try again.', 'err');
      }
    } catch (err) {
      cplShowMsg(msg, 'Network error — please try again.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });
}

function initRefereeRegistration() {
  const form = document.getElementById('referee-reg-form');
  const msg = document.getElementById('referee-reg-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const payload = {
      action: 'registerReferee',
      name: form.name.value.trim(),
      contact: form.contact.value.trim()
    };

    try {
      const result = await CPL.post(payload);
      if (result.ok) {
        cplShowMsg(msg, 'Registration received — you\'ll appear on the referees list once the admin activates your account.', 'ok');
        form.reset();
      } else {
        cplShowMsg(msg, result.error || 'Something went wrong. Please try again.', 'err');
      }
    } catch (err) {
      cplShowMsg(msg, 'Network error — please try again.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });
}
