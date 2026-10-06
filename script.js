const isSerbian = document.documentElement.lang.toLowerCase().startsWith('sr');
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const menuLabels = isSerbian
  ? { open: 'Otvori meni', close: 'Zatvori meni' }
  : { open: 'Открыть меню', close: 'Закрыть меню' };

if (menuButton && mainNav) {
  const setMenuState = (isOpen) => {
    mainNav.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? menuLabels.close : menuLabels.open);
  };
  menuButton.addEventListener('click', () => setMenuState(!mainNav.classList.contains('open')));
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuState(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      setMenuState(false);
      menuButton.focus();
    }
  });
}

const optionalToggle = document.querySelector('.optional-toggle');
const optionalMessage = document.querySelector('#optional-message');

if (optionalToggle && optionalMessage) {
  optionalToggle.addEventListener('click', () => {
    const willOpen = optionalMessage.hasAttribute('hidden');
    optionalMessage.toggleAttribute('hidden');
    optionalToggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) optionalMessage.querySelector('textarea')?.focus();
  });
}

const phoneInput = document.querySelector('input[name="phone"]');
if (phoneInput && !isSerbian) {
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '').slice(0, 11);
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7') && digits.length) digits = '7' + digits;
    const p1 = digits.slice(1, 4);
    const p2 = digits.slice(4, 7);
    const p3 = digits.slice(7, 9);
    const p4 = digits.slice(9, 11);
    phoneInput.value = digits.length
      ? `+7${p1 ? ` ${p1}` : ''}${p2 ? ` ${p2}` : ''}${p3 ? `-${p3}` : ''}${p4 ? `-${p4}` : ''}`
      : '';
  });
}

const form = document.querySelector('#lead-form');
const formStatus = document.querySelector('#form-status');
const formCopy = isSerbian
  ? {
      sending: 'Šaljemo…',
      success: 'Hvala. Upit je poslat.',
      error: 'Upit nije moguće poslati. Pokušajte ponovo malo kasnije.',
      noMessage: 'Komentar nije naveden',
      subject: 'Novi upit sa sajta DOMA (SR)'
    }
  : {
      sending: 'Отправляем…',
      success: 'Спасибо. Заявка отправлена.',
      error: 'Не удалось отправить заявку. Пожалуйста, попробуйте ещё раз чуть позже.',
      noMessage: 'Комментарий не указан',
      subject: 'Новая заявка с сайта DOMA'
    };

if (form && formStatus) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('.form-submit');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.textContent = formCopy.sending;
    form.setAttribute('aria-busy', 'true');
    formStatus.textContent = '';

    const data = Object.fromEntries(new FormData(form).entries());
    delete data._honey;

    try {
      const response = await fetch('https://formsubmit.co/ajax/d2359011@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          message: data.message || formCopy.noMessage,
          _subject: formCopy.subject,
          _template: 'table'
        })
      });

      if (!response.ok) throw new Error('FormSubmit error');

      form.reset();
      optionalMessage?.setAttribute('hidden', '');
      optionalToggle?.setAttribute('aria-expanded', 'false');
      formStatus.textContent = formCopy.success;
    } catch (error) {
      formStatus.textContent = formCopy.error;
    } finally {
      form.removeAttribute('aria-busy');
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });
}
