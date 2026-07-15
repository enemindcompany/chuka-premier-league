/**
 * registrations.js
 * -----------------------------------------------------------------------
 * Chuka Premier League — public registration forms.
 *
 * Handles the three self-serve forms (player / team / referee). Each one
 * posts straight to its own Apps Script action and lands as a "Pending"
 * row for the admin to review — nothing here writes Status: Paid/Active,
 * that's an admin-only edit in the Sheet (see code.gs onEdit trigger).
 *
 * Depends on CPL.post(action, payload) from data.js and cplEscape() for
 * safe message rendering.
 */

// ---------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------

function cplSetSubmitting(button, isSubmitting, idleLabel) {
  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? 'Submitting…' : idleLabel;
}

function cplShowMessage(container, text, kind) {
  // kind: 'success' | 'error'
  container.innerHTML = `<p class="message message--${kind === 'error' ? 'error' : 'success'}">${cplEscape(text)}</p>`;
  container.hidden = false;
}

function cplClearMessage(container) {
  container.hidden = true;
  container.innerHTML = '';
}

function cplRequiredFieldsFilled(form, fieldNames) {
  for (const name of fieldNames) {
    const el = form.elements[name];
    if (!el || !String(el.value || '').trim()) return name;
  }
  return null;
}

// ---------------------------------------------------------------------
// Player registration
// ---------------------------------------------------------------------

function initPlayerRegisterForm() {
  const form = document.getElementById('player-register-form');
  const msg = document.getElementById('player-register-message');
  const submitBtn = document.getElementById('player-register-submit');
  if (!form) return;

  // Populate the team dropdown from both leagues so a new player picks
  // an existing team name exactly as it appears in Teams_A / Teams_B.
  (async function loadTeams() {
    const select = form.elements['Team'];
    try {
      const [teamsA, teamsB] = await Promise.all([CPL.get('Teams_A'), CPL.get('Teams_B')]);
      const names = [...teamsA, ...teamsB]
        .map(r => (r['Name'] || '').trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      for (const name of names) {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      }
    } catch (err) {
      console.error('Could not load teams for registration form', err);
      // Non-fatal — the player can still type a team name isn't possible
      // with a <select>, so leave a note instead of blocking the form.
      const note = document.createElement('option');
      note.value = '';
      note.textContent = 'Could not load team list — contact admin';
      select.appendChild(note);
    }
  })();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    cplClearMessage(msg);

    const missing = cplRequiredFieldsFilled(form, ['Player', 'Team', 'Email', 'Position', 'Payment Ref']);
    if (missing) {
      cplShowMessage(msg, `Please fill in "${missing}" before submitting.`, 'error');
      return;
    }

    const payload = {
      Player: form.elements['Player'].value.trim(),
      Team: form.elements['Team'].value,
      Email: form.elements['Email'].value.trim(),
      Position: form.elements['Position'].value,
      'Payment Ref': form.elements['Payment Ref'].value.trim(),
    };

    cplSetSubmitting(submitBtn, true, 'Register');
    try {
      const res = await CPL.post('registerPlayer', payload);
      if (res && res.ok) {
        form.reset();
        cplShowMessage(msg, 'Registration received. Your CPL number and profile will be activated once your payment is confirmed by an admin.', 'success');
      } else {
        cplShowMessage(msg, (res && res.message) || 'Something went wrong submitting your registration. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      cplShowMessage(msg, 'Could not reach the server. Check your connection and try again.', 'error');
    } finally {
      cplSetSubmitting(submitBtn, false, 'Register');
    }
  });
}

// ---------------------------------------------------------------------
// Team registration
// ---------------------------------------------------------------------

function initTeamRegisterForm() {
  const form = document.getElementById('team-register-form');
  const msg = document.getElementById('team-register-message');
  const submitBtn = document.getElementById('team-register-submit');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    cplClearMessage(msg);

    const missing = cplRequiredFieldsFilled(form, [
      'Team', 'League', 'Contact Name', 'Contact Email', 'Contact Phone', 'Payment Ref',
    ]);
    if (missing) {
      cplShowMessage(msg, `Please fill in "${missing}" before submitting.`, 'error');
      return;
    }

    const payload = {
      Team: form.elements['Team'].value.trim(),
      League: form.elements['League'].value,
      'Contact Name': form.elements['Contact Name'].value.trim(),
      'Contact Email': form.elements['Contact Email'].value.trim(),
      'Contact Phone': form.elements['Contact Phone'].value.trim(),
      'Payment Ref': form.elements['Payment Ref'].value.trim(),
    };

    cplSetSubmitting(submitBtn, true, 'Register Team');
    try {
      const res = await CPL.post('registerTeam', payload);
      if (res && res.ok) {
        form.reset();
        cplShowMessage(msg, 'Team registration received. An admin will confirm payment and add your squad to the league listings.', 'success');
      } else {
        cplShowMessage(msg, (res && res.message) || 'Something went wrong submitting your registration. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      cplShowMessage(msg, 'Could not reach the server. Check your connection and try again.', 'error');
    } finally {
      cplSetSubmitting(submitBtn, false, 'Register Team');
    }
  });
}

// ---------------------------------------------------------------------
// Referee registration
// ---------------------------------------------------------------------

function initRefereeRegisterForm() {
  const form = document.getElementById('referee-register-form');
  const msg = document.getElementById('referee-register-message');
  const submitBtn = document.getElementById('referee-register-submit');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    cplClearMessage(msg);

    const missing = cplRequiredFieldsFilled(form, ['Name', 'Contact']);
    if (missing) {
      cplShowMessage(msg, `Please fill in "${missing}" before submitting.`, 'error');
      return;
    }

    const payload = {
      Name: form.elements['Name'].value.trim(),
      Contact: form.elements['Contact'].value.trim(),
    };

    cplSetSubmitting(submitBtn, true, 'Register');
    try {
      const res = await CPL.post('registerReferee', payload);
      if (res && res.ok) {
        form.reset();
        cplShowMessage(msg, 'Registration received. An admin will review it and activate your listing.', 'success');
      } else {
        cplShowMessage(msg, (res && res.message) || 'Something went wrong submitting your registration. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      cplShowMessage(msg, 'Could not reach the server. Check your connection and try again.', 'error');
    } finally {
      cplSetSubmitting(submitBtn, false, 'Register');
    }
  });
}
