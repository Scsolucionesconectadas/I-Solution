// Native constraints remain the source of truth; without JS the browser validates normally.
export function installFormValidation(form) {
  if (!form.id) form.id = 'inquiry-form';
  const fields = [...form.querySelectorAll('input,select,textarea')].filter(field => field.willValidate);
  const errors = new Map();
  const summary = document.createElement('div');
  summary.className = 'form-errors';
  summary.hidden = true;
  summary.tabIndex = -1;
  summary.setAttribute('role', 'alert');
  const title = document.createElement('p');
  title.id = form.id + '-errors-title';
  title.textContent = 'Revisá los campos indicados para continuar.';
  summary.setAttribute('aria-labelledby', title.id);
  const list = document.createElement('ul');
  summary.append(title, list);
  form.prepend(summary);
  form.noValidate = true;

  function message(field) {
    if (field.validity.customError) return field.validationMessage;
    if (field.validity.valueMissing) return field.tagName === 'SELECT' ? 'Seleccioná una opción.' : 'Completá este campo.';
    if (field.validity.typeMismatch || field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) return 'Escribí un correo válido, por ejemplo nombre@empresa.com.';
    if (field.validity.tooShort || field.minLength > 0 && field.value.length > 0 && field.value.length < field.minLength) return 'Escribí al menos ' + field.minLength + ' caracteres.';
    if (field.validity.tooLong || field.maxLength > 0 && field.value.length > field.maxLength) return 'Usá hasta ' + field.maxLength + ' caracteres.';
    return field.validity.valid ? '' : 'Revisá el valor de este campo.';
  }
  function update(field) {
    const text = field.disabled ? '' : message(field);
    let entry = errors.get(field);
    if (!text) {
      if (entry) {
        entry.node.remove();
        if (entry.describedBy === null) field.removeAttribute('aria-describedby');
        else field.setAttribute('aria-describedby', entry.describedBy);
        field.removeAttribute('aria-invalid');
        errors.delete(field);
      }
      return;
    }
    if (!entry) {
      const node = document.createElement('p');
      node.id = field.id + '-error';
      node.className = 'field-error';
      const describedBy = field.getAttribute('aria-describedby');
      entry = {node, describedBy};
      errors.set(field, entry);
      field.insertAdjacentElement('afterend', node);
      field.setAttribute('aria-describedby', [describedBy, node.id].filter(Boolean).join(' '));
    }
    field.setAttribute('aria-invalid', 'true');
    entry.node.textContent = text;
  }
  function renderSummary() {
    list.replaceChildren();
    for (const field of fields) {
      const error = errors.get(field);
      if (!error) continue;
      const item = document.createElement('li'), link = document.createElement('a');
      link.href = '#' + field.id;
      const label = field.labels?.[0]?.textContent.replace(/\s+/g, ' ').trim() || 'Campo';
      link.textContent = label + ': ' + error.node.textContent;
      link.addEventListener('click', event => {
        event.preventDefault();
        field.focus({preventScroll:true});
        field.scrollIntoView({block:'center',behavior:'instant'});
      });
      item.append(link); list.append(item);
    }
    summary.hidden = errors.size === 0;
  }
  function clear() {
    for (const field of fields) {
      field.setCustomValidity('');
      const entry = errors.get(field);
      if (!entry) continue;
      entry.node.remove();
      if (entry.describedBy === null) field.removeAttribute('aria-describedby');
      else field.setAttribute('aria-describedby', entry.describedBy);
      field.removeAttribute('aria-invalid');
      errors.delete(field);
    }
    renderSummary();
  }
  form.addEventListener('input', event => {
    const field = event.target;
    if (!fields.includes(field)) return;
    field.setCustomValidity('');
    if (errors.has(field)) { update(field); renderSummary(); }
  });
  form.addEventListener('change', event => {
    if (errors.has(event.target)) { update(event.target); renderSummary(); }
  });
  form.addEventListener('reset', () => queueMicrotask(clear));
  return {
    clear,
    validate() {
      fields.forEach(update);
      renderSummary();
      if (errors.size) {
        summary.focus({preventScroll:true});
        summary.scrollIntoView({block:'nearest',behavior:'instant'});
      }
      return errors.size === 0;
    }
  };
}
